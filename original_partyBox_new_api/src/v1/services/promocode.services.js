const { getCurrentTime } = require("../utils");
const { findAll } = require("../mongo/repo");

exports.validatePromocode = async (promocode) => {
  const now = getCurrentTime().toDate
    ? getCurrentTime().toDate()
    : new Date(getCurrentTime().format("YYYY-MM-DD HH:mm:ss"));

  const response = await findAll(
    "promocodes",
    {
      code: String(promocode),
      status: 1,
      starts_at: { $lte: now },
      expires_at: { $gte: now },
    },
    {
      attributes: [
        "discount",
        "type",
        "usage_count",
        "usage_limit",
        "minpromotype",
        "minimum_total",
      ],
    }
  );

  return response;
};
