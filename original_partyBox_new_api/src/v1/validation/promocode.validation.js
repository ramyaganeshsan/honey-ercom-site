let JOI = require("joi");

exports.validatePromocodeSchema = {
  body: JOI.object().keys({
    promocode: JOI.string().required().label("Promocode"),
  }),
};
