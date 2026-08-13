const mongoose = require("mongoose");

let connectionPromise = null;

function getMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  const dbName = process.env.DATABASE_NAME || "honey_ecommerce";
  return `mongodb://127.0.0.1:27017/${dbName}`;
}

/**
 * Connect to MongoDB (singleton). Safe to call multiple times.
 * @returns {Promise<typeof mongoose>}
 */
async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (!connectionPromise) {
    const uri = getMongoUri();
    connectionPromise = mongoose
      .connect(uri)
      .then(() => mongoose)
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }
  return connectionPromise;
}

async function disconnectMongo() {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectMongo,
  disconnectMongo,
  getMongoUri,
  mongoose,
};
