import backupDB from "../database/backupDB";
import db from "../database";
import stringifyMongo from "../utils/stringifyMongo";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import generateLogBars from "../utils/generateLogBars";

export default class Collection {
  collectionName: string;

  constructor({ collectionName }: { collectionName: string }) {
    this.collectionName = collectionName;
  }

  async backupCollection(
    backupPath: string,
    {
      folderName,
      folderFormat,
      progress,
      total,
    }: {
      folderName: string;
      folderFormat: string;
      progress: number;
      total: number;
    },
  ) {
    const collection = db.collection(this.collectionName);
    const items = await collection.find().toArray();

    await backupDB.collection(this.collectionName).deleteMany({});

    if (items.length > 0) {
      await backupDB.collection(this.collectionName).insertMany(items);
    }

    const itemsString = JSON.stringify(items, stringifyMongo, 2);

    if (!fs.existsSync(path.join(folderName, backupPath))) {
      fs.mkdirSync(path.join(folderName, backupPath));
    }

    fs.writeFileSync(
      path.join(
        folderName,
        backupPath,
        `${dayjs().format(folderFormat)}-${this.collectionName}.json`,
      ),
      itemsString,
    );

    console.log(
      `|${generateLogBars(progress, total!)}| ${((progress / total!) * 100).toFixed(2)}% (${progress}/${total}) ${this.collectionName} completed.\n`,
    );

    process.exit(0);
  }
}

process.on(
  "collectionName",
  ({
    collectionName,
    backupPath,
    folderName,
    folderFormat,
    progress,
    total,
  }: {
    collectionName: string;
    backupPath: string;
    folderName: string;
    folderFormat: string;
    progress: number;
    total: number;
  }) =>
    new Collection({ collectionName }).backupCollection(backupPath, {
      folderName,
      folderFormat,
      progress,
      total,
    }),
);
