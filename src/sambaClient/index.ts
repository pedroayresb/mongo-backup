import fs from "fs";
import path from "path";
import SambaClient from "samba-client";


const address = process.env.SAMBA_ADDRESS || "";
const username = process.env.SAMBA_USERNAME || "";
const password = process.env.SAMBA_PASSWORD || "";

const client = new SambaClient({
  address,
  username,
  password,
});

async function createFolder(
  folderName: string,
) {
  await client.mkdir(`backup/${folderName}`, path.join(`./backup/${folderName}`));
  // moves all files from the folder to the new folder
  const files = fs.readdirSync(`./backup/${folderName}`);
  for (const file of files) {
    await client.sendFile(
      path.join(`./backup/${folderName}`, file),
      `backup/${folderName}/${file}`
    );
  }
}

export default createFolder;
