import { getRedisClient } from "../../DB/redis.connection";
import { BadRequestError } from "../utils/error.utils";

type RedisClient = NonNullable<ReturnType<typeof getRedisClient>>;

class RedisService {
  private requireClient(): RedisClient {
    const client = getRedisClient();
    if (!client) {
      throw new BadRequestError("Redis client not initialized");
    }
    return client;
  }

  async set(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<void> {
    const client = this.requireClient();
    if (expireInSeconds !== undefined) {
      await client.setEx(key, expireInSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.requireClient().get(key);
  }

  async del(key: string): Promise<number> {
    return this.requireClient().del(key);
  }

  async exists(key: string): Promise<number> {
    return this.requireClient().exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.requireClient().expire(key, seconds);
  }

  async storeToken(
    token: string,
    userId: string,
    expireInSeconds: number = 3600,
  ): Promise<void> {
    await this.set(`token:${token}`, userId, expireInSeconds);
  }

  async revokeToken(token: string): Promise<boolean> {
    return (await this.del(`token:${token}`)) > 0;
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      return (await this.exists(`token:${token}`)) === 0;
    } catch {
      return true;
    }
  }

  async storeOtp(
    email: string,
    otp: string,
    expireInSeconds: number = 600,
  ): Promise<void> {
    await this.set(`otp:${email}`, otp, expireInSeconds);
  }

  async getOtp(email: string): Promise<string | null> {
    return this.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<boolean> {
    return (await this.del(`otp:${email}`)) > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const client = this.requireClient();
    const keys = await client.keys("token:*");
    for (const key of keys) {
      const storedUserId = await this.get(key);
      if (storedUserId === userId) {
        await this.del(key);
      }
    }
  }
}

export const redisService = new RedisService();
