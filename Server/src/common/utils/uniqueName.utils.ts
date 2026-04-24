import { v4 as uuid4 } from "uuid";
import type { ObjectId } from "mongoose";

export const uniqueNameGenerator = (userId: ObjectId): string => {
  return `${userId}-${uuid4()}`;
};
