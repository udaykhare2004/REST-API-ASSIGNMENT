const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("REDIS_URL not set, running without cache");
    return null;
  }

  redisClient = createClient({ url: redisUrl });
  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  try {
    await redisClient.connect();
    console.log("Redis connected");
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed, cache disabled:", error.message);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
