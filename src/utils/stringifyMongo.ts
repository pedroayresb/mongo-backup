import { ObjectId } from "mongodb";

function stringifyMongo(
  item: ObjectId | Date | { $oid: string } | { $date: string } | { [key: string]: any } | any[] | any
) {
  if (item instanceof ObjectId) {
    item = { $oid: item.toString() };
  }

  if (item instanceof Date) {
    item = { $date: item.toISOString() };
  }

  if (item && typeof item === "object") {
    Object.keys(item).forEach((key) => {
      item[key] = stringifyMongo(item[key]);
    });
  }

  if (Array.isArray(item)) {
    item.forEach((element, index) => {
      item[index] = stringifyMongo(element);
    });
  }

  return item;
}

export default stringifyMongo;
