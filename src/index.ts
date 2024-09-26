import stringifyMongo from "./utils/stringifyMongo";
import db from "./database";
import fs from "fs";
import path from "path";
import { CronJob, CronTime } from "cron";
import createFolder from "./sambaClient";
import backupDB from "./database/backupDB";
import dayjs from "dayjs";
import generateLogBars from "./utils/generateLogBars";
import { execSync } from "child_process";

const cronTime = process.env.CRON_TIME || `0 0 12,18 * * *`;
const logFormat = process.env.LOG_FORMAT || "DD/MM/YYYY HH:mm:s";
const folderFormat = process.env.FOLDER_FORMAT || "DD-MM-YYYY_HH-mm";
const folderName = process.env.FOLDER_NAME || "backup";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName);
}

class MongoManager {
  cronTime: string;
  logFormat: string;
  folderFormat: string;
  folderName: string;

  constructor({
    cronTime,
    logFormat,
    folderFormat,
    folderName,
  }: {
    cronTime: string;
    logFormat: string;
    folderFormat: string;
    folderName: string;
  }) {
    this.cronTime = cronTime;
    this.logFormat = logFormat;
    this.folderFormat = folderFormat;
    this.folderName = folderName;

    this.routine = this.routine.bind(this);
  }

  private async backupCollection(collectionName: string, backupPath: string) {
    const collection = db.collection(collectionName);
    const items = await collection.find().toArray();

    await backupDB.collection(collectionName).deleteMany({});
    if (items.length > 0) {
      await backupDB.collection(collectionName).insertMany(items);
    }
    const itemsString = JSON.stringify(items, stringifyMongo, 2);
    if (!fs.existsSync(path.join(this.folderName, backupPath))) {
      fs.mkdirSync(path.join(this.folderName, backupPath));
    }
    fs.writeFileSync(
      path.join(
        this.folderName,
        backupPath,
        `${dayjs().format(this.folderFormat)}-${collectionName}.json`,
      ),
      itemsString,
    );
  }

  private async backup() {
    const date = dayjs().format(this.folderFormat);
    execSync(
      `mongodump --uri ${MONGO_URI} --db ${MONGO_DB_NAME} --out ${this.folderName}/${date}`,
    );
  }

  async routine() {
    const job = new CronJob(this.cronTime, async () => {
      await this.backup();
    });

    job.start();
  }
}

const mongoManager = new MongoManager({
  cronTime,
  logFormat,
  folderFormat,
  folderName,
});

mongoManager.routine();
