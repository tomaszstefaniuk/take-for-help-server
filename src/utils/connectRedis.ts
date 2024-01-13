import { createClient } from "redis";

const redisUrl = process.env.REDIS_TLS_URL;

const redisClient = createClient({
  url: redisUrl,
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis client connected successfully");
      redisClient.set("try", "Hello Welcome to Express with TypeORM");
    } else {
      console.log("Redis client is already connected");
    }
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

connectRedis();

export default redisClient;
