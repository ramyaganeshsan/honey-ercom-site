const { createClient } = require("redis");

let REDIS_CLIENT = null;

exports.connectRedis = async () => {
  if (REDIS_CLIENT) return REDIS_CLIENT;
  REDIS_CLIENT = createClient();
  await REDIS_CLIENT.connect();
};

exports.getRedisClient = () => {
  return REDIS_CLIENT;
};
