import { createClient } from "redis";
import { env } from "../config/env.config";

let redisClientInstance: any = null;

export const redisConnection = async (): Promise<void> => {
  try {
    const client = createClient({ url: env.REDIS_URL as string });
    await client.connect();
    redisClientInstance = client;
    console.log(`Connected to Redis ❤️❤️`);
  } catch (error) {
    console.log(`Error connecting to Redis: ${error}`);
    process.exit(1);
  }
};

export const getRedisClient = () => redisClientInstance;

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClientInstance) {
    await redisClientInstance.quit();
    redisClientInstance = null;
  }
};
