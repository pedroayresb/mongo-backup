import fs from "fs";
import path from "path";
import SambaClient from "samba-client";
import dotenv from "dotenv";

const dirname = path.resolve(path.dirname(""));

dotenv.config({ path: path.join(dirname, ".env") });

const address = process.env.SAMBA_ADDRESS || "";
const username = process.env.SAMBA_USERNAME || "";
const password = process.env.SAMBA_PASSWORD || "";

const client = new SambaClient({
  address,
  username,
  password,
});

async function createFolder(backupPath: string, folderName: string) {
  await client.mkdir(
    `/${backupPath}/${folderName}`,
    path.join(`./${backupPath}/${folderName}`),
  );

  const files = fs.readdirSync(`./${backupPath}/${folderName}`);

  for (const file of files) {
    await client.sendFile(
      path.join(`./${backupPath}/${folderName}`, file),
      `${backupPath}/${folderName}/${file}`,
    );
  }
}

export default createFolder;
