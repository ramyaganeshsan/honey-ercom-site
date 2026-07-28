const JOI = require("joi");

exports.cancelOrderSchema = {
  body: JOI.object().keys({
    cartId: JOI.number().required(),
    orderId: JOI.number().required(),
    cancellationReason: JOI.string().required(),
    productId: JOI.number().allow(null, ""),
  }),
};
