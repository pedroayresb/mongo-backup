import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

const dirname = path.resolve(path.dirname(""));

dotenv.config({ path: path.join(dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

console.log(`Connecting to MongoDB at ${MONGO_URI}`);
const mongoClient = new MongoClient(MONGO_URI, {});

mongoClient.connect();

const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "";

const db = mongoClient.db(MONGO_DB_NAME);
console.log(`Connected to database ${MONGO_DB_NAME}`);

export default db;
