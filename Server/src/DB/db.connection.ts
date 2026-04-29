import mongoose from "mongoose";
import { env } from "../config/env.config";

export const dbConnection = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGO_URI ?? "");
        console.log(`Connected to MongoDB 👌👌`);
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};

export const closeDbConnection = async (): Promise<void> => {
  await mongoose.connection.close();
};