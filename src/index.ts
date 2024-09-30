import fs from "fs";
import path from "path";
import createFolder from "./sambaClient";
import dayjs from "dayjs";
import { exec } from "child_process";
import dotenv from "dotenv";

const dirname = path.resolve(path.dirname(""));

dotenv.config({ path: path.join(dirname, ".env") });

// const cronTime = process.env.CRON_TIME || `0 0 12,18 * * *`;
const cronTime = "*/30 * * * * *";
const logFormat = process.env.LOG_FORMAT || "DD/MM/YYYY HH:mm:ss";
const folderFormat = process.env.FOLDER_FORMAT || "DD-MM-YYYY_HH-mm";
const folderName = process.env.FOLDER_NAME || "backup";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName);
}

const executeCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });

    // Log the output in real-time
    childProcess.stdout!.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr!.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
  });
};

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

  private async backup() {
    const date = dayjs().format(this.folderFormat);
    console.log("Starting backup at: ", date);
    console.log(MONGO_URI, MONGO_DB_NAME);
    await executeCommand(
      `mongodump --uri='${MONGO_URI}' --db=${MONGO_DB_NAME} --out=./${this.folderName}/${date}`,
    );

    await createFolder(this.folderName, date);
  }

  async routine() {
    // const job = new CronJob(this.cronTime, async () => {
    // });

    await this.backup();

    // console.log(
    //   `Routine Started: ${dayjs().format(this.logFormat)} - Next Backup: ${dayjs(
    //     job.nextDate().toJSDate(),
    //   ).format(this.logFormat)}`,
    // );

    // job.start();
  }
}

const mongoManager = new MongoManager({
  cronTime,
  logFormat,
  folderFormat,
  folderName,
});

mongoManager.routine();
