const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* Logger */
const logger = require("./src/v1/utils/logger");

/* utility functions */
const { getMessage, getStatusCode } = require("./src/v1/utils/index");
const { validateUser } = require("./src/v1/middleware/user.middleware");
const {
  handleTabbyWebhook,
} = require("./src/v1/controller/checkout.controller.js");
const {
  registerTamaraWebhook,
} = require("./src/v1/controller/checkout.controller");
const app = express();

app.use(cors());
app.use(express.json());

/* Compress all the repsonse */
const compression = require("compression");
app.use(compression());

const PORT = process.env.PORT || 5000;

/* Calling webhooks event for taay */
// app.post("/api/checkoutTest/webhooks/tabby", handleTabbyWebhook);

/* JWT Token validatio */
const { validateJwtToken } = require("./src/v1/middleware/auth.middleware");
app.use("/api/*", validateJwtToken);
app.use("/api/cart", validateUser);
app.use("/api/wishlist", validateUser);
app.use("/api/orders", validateUser);
app.use("/api/user", validateUser);
/* Version */
const baseAPIurl = "/api";
const version = "v1";

const authRoutes = require(`./src/${version}/routes/auth.routes.js`);
const productRoutes = require(`./src/${version}/routes/product.routes.js`);
const homePageRoutes = require(`./src/${version}/routes/home.routes.js`);
const userRoutes = require(`./src/${version}/routes/users.routes.js`);
const reviewRoutes = require(`./src/${version}/routes/review.routes.js`);
const contactusRoutes = require(`./src/${version}/routes/contactus.routes.js`);
const wishlistRoutes = require(`./src/${version}/routes/wishlist.routes.js`);
const cartRoutes = require(`./src/${version}/routes/cart.routes.js`);
const checkoutRoutes = require(`./src/${version}/routes/checkout.routes.js`);
const promocodeRoutes = require(`./src/${version}/routes/promocode.routes.js`);
const cmsRoutes = require(`./src/${version}/routes/cms.routes.js`);
const commonRoutes = require(`./src/${version}/routes/common.routes.js`);
const ordersRoutes = require(`./src/${version}/routes/orders.routes.js`);
const cronRoutes = require(`./src/${version}/routes/cron.routes.js`);
const checkoutTestRoutes = require(`./src/${version}/routes/checkoutTest.routes.js`);

console.log = () => {};

// app.use((req, res, next) => {
//   console.error("=============================");
//   let path = req?.baseUrl;
//   console.error(req.originalUrl);
//   console.error(req.headers);
//   console.error(req.body);
//   console.error(req.query);
//   console.error("=============  END ===============");
//   next();
// });

app.use(`${baseAPIurl}/auth`, authRoutes);
app.use(`${baseAPIurl}/products`, productRoutes);
app.use(`${baseAPIurl}/home`, homePageRoutes);
app.use(`${baseAPIurl}/user`, userRoutes);
app.use(`${baseAPIurl}/review`, reviewRoutes);
app.use(`${baseAPIurl}/contactus`, contactusRoutes);
app.use(`${baseAPIurl}/wishlist`, wishlistRoutes);
app.use(`${baseAPIurl}/cart`, cartRoutes);
app.use(`${baseAPIurl}/checkout`, checkoutRoutes);
app.use(`${baseAPIurl}/checkoutTest`, checkoutTestRoutes);

app.use(`${baseAPIurl}/promocode`, promocodeRoutes);
app.use(`${baseAPIurl}/cms`, cmsRoutes);
app.use(`${baseAPIurl}/common`, commonRoutes);
app.use(`${baseAPIurl}/orders`, ordersRoutes);
app.use(`${baseAPIurl}/cron`, cronRoutes);

/* Sharing asset's */
app.use("/public", express.static("assets"));
/* Product/banner uploads (DASHBOARD_URL + cloud/uploads/...) */
app.use("/cloud", express.static("cloud"));

// app.all("*", (req, res) => {
//   logger.error(`INVALID REQUESTED URL : ${req.path}`);
//   res.status(404).send({
//     status: getStatusCode("invalid_route"),
//     message: getMessage("invalid_route"),
//   });
// });

app.use((err, req, res, next) => {
  logger.error(err ?? "Something went wrong");
  if (!res.headersSent) {
    res.send({
      status: getStatusCode("server_error"),
      message: getMessage("server_error"),
    });
  }
});

const { connectMongo } = require("./src/v1/mongo/connection");
const { connectRedis, getRedisClient } = require("./src/v1/redis");

async function startServer() {
  try {
    await connectMongo();
    logger.info("MongoDB connection established");
  } catch (err) {
    logger.error(err ?? "Failed to connect to MongoDB");
    process.exit(1);
  }

  try {
    await connectRedis();
    global.REDIS_CLIENT = getRedisClient();
    logger.info("Redis connection established");
  } catch (err) {
    // Redis is optional for local/demo — cache helpers already tolerate failures
    global.REDIS_CLIENT = null;
    logger.error(err ?? "Failed to start REDIS SERVER (continuing without Redis)");
  }

  app.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
    // registerWebhook();
    // registerTamaraWebhook();
  });
}

startServer();
