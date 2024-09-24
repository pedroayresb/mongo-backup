import { ObjectId } from "mongodb";

function parseMongo(item:
  { $oid: string } |
  { $date: string } |
  { [key: string]: any } |
  any[] |
  any
) {
  if (item && item.hasOwnProperty("$oid")) {
    return new ObjectId(item.$oid);
  }

  if (item && item.hasOwnProperty("$date")) {
    return new Date(item.$date);
  }

  if (item && typeof item === "object") {
    Object.keys(item).forEach((key) => {
      item[key] = parseMongo(item[key]);
    });
  }

  if (Array.isArray(item)) {
    item.forEach((element, index) => {
      item[index] = parseMongo(element);
    });
  }

  return item;
}

export default parseMongo;
