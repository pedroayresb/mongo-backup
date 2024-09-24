import stringifyMongo from "./utils/stringifyMongo";
import db from "./database";
import fs from "fs";
import path from "path";
import { CronJob } from "cron";

if (!fs.existsSync("./backup")) {
  fs.mkdirSync("./backup");
}

async function backupCollection(collectionName: string, backupPath: string) {
  const collection = db.collection(collectionName);
  const items = await collection.find().toArray();
  const itemsStringified = items.map((item) => stringifyMongo(item));
  const itemsString = JSON.stringify(itemsStringified, null, 2);
  if (!fs.existsSync(path.join("./backup", backupPath))) {
    fs.mkdirSync(path.join("./backup", backupPath));
  }
  fs.writeFileSync(path.join("./backup", backupPath, `${new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").split(".")[0]}-${collectionName}.json`), itemsString);
}

class MongoManager {
  constructor() {
    this.backup = this.backup.bind(this);
  }

  async backup() {
    const collections = await db.listCollections().toArray();

    const date = new Date().toISOString();
    // format date to MMddYYYY-HH-mm
    const formattedDate = date.replace(/[-:]/g, "").replace("T", "-").split(".")[0];

    for (const collection of collections) {
      await backupCollection(collection.name, formattedDate);
      console.log(`Backup for collection ${collection.name} completed`);
    }

    console.log(`Backup completed at ${date}`);
  }

  async routine(hour: number) {
    const job = new CronJob(`0 0 ${hour} * * *`, async () => {
      await this.backup();
    });

    job.start();
  }
}

const mongoManager = new MongoManager();


mongoManager.routine(12);

mongoManager.routine(18);
