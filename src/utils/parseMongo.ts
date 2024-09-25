/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */
import { ObjectId } from "mongodb";

function parseMongo(
  _: string,
  item:
    | ObjectId
    | Date
    | { $oid: string }
    | { $date: string }
    | { [key: string]: any }
    | any[]
    | any,
) {
  if (item && item.hasOwnProperty("$oid")) {
    return new ObjectId(item.$oid);
  }

  if (item && item.hasOwnProperty("$date")) {
    return new Date(item.$date);
  }

  if (item && typeof item === "object") {
    Object.keys(item).forEach((key) => {
      item[key] = parseMongo(_, item[key]);
    });
  }

  if (Array.isArray(item)) {
    item.forEach((element, index) => {
      item[index] = parseMongo(_, element);
    });
  }

  return item;
}

export default parseMongo;
