const { getSiteInfo } = require("../services/common.services");
const { getOutOfStockProductDetails } = require("../services/cron.services");
const {
  sendProductOutOfStockEmail,
} = require("../services/notification.services");
const { getCurrentTime } = require("../utils");
const logger = require("../utils/logger");

exports.productOutOfStockNotification = async (req, res, next) => {
  try {
    let siteInfo = await getSiteInfo();

    if (siteInfo && siteInfo["sendOutOfStockNotification"]) {
      logger.info(
        `Sending out of stock order notification ${getCurrentTime().format(
          "YYYY-MM-DD hh:mm:ss"
        )}`
      );
      let productDetails = await getOutOfStockProductDetails(
        siteInfo?.minimumProductQuantityToNotify ?? 10
      );
      let productHeaders = ["productName", "sizeName", "quantity"];
      await sendProductOutOfStockEmail(
        productDetails,
        productHeaders,
        siteInfo?.adminEmailAddress
      );
    }

    res.end();
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
