const { createClient } = require("redis");

let REDIS_CLIENT = null;

exports.connectRedis = async () => {
  // Local/demo runs without Redis — skip connect noise (AggregateError).
  if (process.env.NODE_ENV === "development" || process.env.SKIP_REDIS === "1") {
    REDIS_CLIENT = null;
    return null;
  }

  if (REDIS_CLIENT) return REDIS_CLIENT;

  const url = process.env.REDIS_URL || undefined;
  REDIS_CLIENT = createClient(url ? { url } : undefined);

  REDIS_CLIENT.on("error", () => {
    /* suppress reconnect spam; callers tolerate null client */
  });

  await REDIS_CLIENT.connect();
  return REDIS_CLIENT;
};

exports.getRedisClient = () => {
  return REDIS_CLIENT;
};
