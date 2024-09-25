import stringifyMongo from "./utils/stringifyMongo";
import db from "./database";
import fs from "fs";
import path from "path";
import { CronJob, CronTime } from "cron";
import createFolder from "./sambaClient";
import backupDB from "./database/backupDB";
import dayjs from "dayjs";
import generateLogBars from "./utils/generateLogBars";

const cronTime = process.env.CRON_TIME || `0 0 12,18 * * *`;
const logFormat = process.env.LOG_FORMAT || "DD/MM/YYYY HH:mm:s";
const folderFormat = process.env.FOLDER_FORMAT || "DD-MM-YYYY_HH-mm";
const folderName = process.env.FOLDER_NAME || "backup";

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
    const itemsString = JSON.stringify(
      items,
      stringifyMongo,
      2
    );
    if (!fs.existsSync(path.join(this.folderName, backupPath))) {
      fs.mkdirSync(path.join(this.folderName, backupPath));
    }
    fs.writeFileSync(path.join(this.folderName, backupPath, `${dayjs().format(this.folderFormat)}-${collectionName}.json`), itemsString);
  }

  private async backup() {
    const collections = await db.listCollections().toArray();

    const date = dayjs()

    const formattedDate = date.format(this.folderFormat);

    let progress = 1;
    const total = collections.length;

    await Promise.all(
      collections.map(async (collection) => {
        await this.backupCollection(collection.name, formattedDate);

        console.log(`|${generateLogBars(progress, total)}| ${((progress / total) * 100).toFixed(2)}% (${progress}/${total}) ${collection.name} completed.\n`);

        progress += 1;

        return true;
      })
    );
    await createFolder(this.folderName, formattedDate);

    fs.rmSync(path.join(this.folderName, formattedDate), { recursive: true });

    const nextDate = dayjs(new CronTime(this.cronTime).getNextDateFrom(new Date()).toJSDate()).format(this.logFormat);

    console.log(`Backup completed at ${date.format(this.logFormat)}. Next backup at ${nextDate}.\n`);
  }

  async routine() {
    const job = new CronJob(
      this.cronTime,
      async () => {
        await this.backup();
      },
    );

    job.start();
  }
}

const mongoManager = new MongoManager({
  cronTime,
  logFormat,
  folderFormat,
  folderName,
})


mongoManager.routine();
