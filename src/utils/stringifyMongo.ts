import { ObjectId } from "mongodb";

function stringifyMongo(
  _: string,
  item:  ObjectId | Date | { $oid: string } | { $date: string } | { [key: string]: any } | any[] | any
) {
  if (item instanceof ObjectId) {
    item = { $oid: item.toString() };
  }

  if (item instanceof Date) {
    item = { $date: item.toISOString() };
  }

  if (item && typeof item === "object") {
    Object.keys(item).forEach((key) => {
      item[key] = stringifyMongo(_, item[key]);
    });
  }

  if (Array.isArray(item)) {
    item.forEach((element, index) => {
      item[index] = stringifyMongo(_, element);
    });
  }

  return item;
}

export default stringifyMongo;
