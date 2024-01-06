import { createClient } from "redis";

let redisClient: any;

const connectRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("connect", () => {
      console.log("Redis client connected successfully");
      redisClient.set("try", "Hello Welcome to Express with TypeORM");
    });

    redisClient.on("error", (err: any) => {
      console.error("Redis connection error:", err);
    });
  }

  return redisClient;
};

export default connectRedis;
