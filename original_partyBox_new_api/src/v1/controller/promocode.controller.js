const { validatePromocode } = require("../services/promocode.services");
const { getStatusCode, getMessage } = require("../utils");
const logger = require("../utils/logger");

exports.validatePromocode = async (req, res, next) => {
  try {
    let { promocode } = req.body;
    let promocodeResponse = await validatePromocode(promocode);

    let response = {
      status: getStatusCode("failed"),
      data: {},
      message: getMessage("invalid_promocode", req.lang),
    };

    if (promocodeResponse && promocodeResponse.length > 0) {
      response.status = getStatusCode("success");
      response.data = promocodeResponse[0];
      response.message = getMessage("promocode_applied_successfully", req.lang);
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
