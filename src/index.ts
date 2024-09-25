import db from "./database";
import fs from "fs";
import path from "path";
import { CronJob, CronTime } from "cron";
import createFolder from "./sambaClient";
import dayjs from "dayjs";
import { fork } from "child_process";

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
  total?: number;

  private progress: number;

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

    this.progress = 1;

    this.routine = this.routine.bind(this);
  }

  private async backup() {
    const collections = await db.listCollections().toArray();

    const date = dayjs();

    const formattedDate = date.format(this.folderFormat);

    this.total = collections.length;

    await Promise.all(
      collections.map((collection) => {
        new Promise((resolve) => {
          const forked = fork(path.join(__dirname, "model"));

          forked.send({
            collectionName: collection.name,
            backupPath: formattedDate,
            folderName: this.folderName,
            folderFormat: this.folderFormat,
            progress: this.progress,
            total: this.total,
          });

          forked.on("exit", () => {
            this.progress += 1;
            resolve(true);
          });
        });
      }),
    );
    await createFolder(this.folderName, formattedDate);

    fs.rmSync(path.join(this.folderName, formattedDate), { recursive: true });

    const nextDate = dayjs(
      new CronTime(this.cronTime).getNextDateFrom(new Date()).toJSDate(),
    ).format(this.logFormat);

    console.log(
      `Backup completed at ${date.format(this.logFormat)}. Next backup at ${nextDate}.\n`,
    );
  }

  async routine() {
    new CronJob(
      this.cronTime,
      async () => {
        console.log(`Backup started at ${dayjs().format(this.logFormat)}.\n`);
        await this.backup();
      },
      null,
      true,
    );

    console.log(
      `Backup routine started at ${dayjs().format(this.logFormat)}.\n`,
    );
    console.log(
      `Next backup at ${dayjs(new CronTime(this.cronTime).getNextDateFrom(new Date()).toJSDate()).format(this.logFormat)}.\n`,
    );
  }
}

const mongoManager = new MongoManager({
  cronTime,
  logFormat,
  folderFormat,
  folderName,
});

mongoManager.routine();
