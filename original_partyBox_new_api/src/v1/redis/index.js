const { createClient } = require("redis");

let REDIS_CLIENT = null;

const REDIS_CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 3000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

exports.connectRedis = async () => {
  // Local/demo runs without Redis — skip connect noise (AggregateError).
  if (process.env.NODE_ENV === "development" || process.env.SKIP_REDIS === "1") {
    REDIS_CLIENT = null;
    return null;
  }

  if (REDIS_CLIENT) return REDIS_CLIENT;

  const url = process.env.REDIS_URL || undefined;
  const client = createClient(url ? { url } : undefined);

  client.on("error", () => {
    /* suppress reconnect spam; callers tolerate null client */
  });

  try {
    await withTimeout(client.connect(), REDIS_CONNECT_TIMEOUT_MS, "Redis connect");
    REDIS_CLIENT = client;
    return REDIS_CLIENT;
  } catch (err) {
    try {
      await client.quit().catch(() => client.disconnect().catch(() => {}));
    } catch {
      /* ignore */
    }
    REDIS_CLIENT = null;
    throw err;
  }
};

exports.getRedisClient = () => {
  return REDIS_CLIENT;
};
