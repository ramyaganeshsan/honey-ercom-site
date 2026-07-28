const JOI = require("joi");

exports.updateCartSchema = {
  body: JOI.object().keys({
    productDetails: JOI.array()
      .items({
        deal_id: JOI.number().required(),
        cart_id: JOI.number().required(),
        item_id: JOI.number().required(),
        item_quantity: JOI.number().required(),
        currentPrice: JOI.number().required(),
        sub_product_id: JOI.number().required(),
      })
      .required()
      .label("Products"),
    shippingCost: JOI.number().label("Shipping cost"),
    totalAmount: JOI.number().label("Total cost"),
    processPayment: JOI.boolean().allow(null, "").label("Process payment"),
  }),
};

// exports.addToCartSchema = {
//   body: JOI.object().keys({
//     dealId: JOI.number().required().label("Product ID"),
//     quantity: JOI.number().allow(null, "").label("Quantity"),
//     sizeId: JOI.number().allow(null, "").label("Size"),
//   }),
// };

exports.addToCartSchema = {
  body: JOI.alternatives().try(
    JOI.object().keys({
      dealId: JOI.number().required().label("Product ID"),
      quantity: JOI.number().allow(null, "").label("Quantity"),
      sizeId: JOI.number().allow(null, "").label("Size"),
    }),
    JOI.object().keys({
      products: JOI.array()
        .items(
          JOI.object().keys({
            dealId: JOI.number().required().label("Product ID"),
            quantity: JOI.number().allow(null, "").label("Quantity"),
            sizeId: JOI.number().allow(null, "").label("Size"),
          })
        )
        .required()
        .label("Products"),
    })
  ),
};
