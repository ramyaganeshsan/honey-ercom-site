const JOI = require("joi");

exports.cartCheckoutSchema = {
  body: JOI.object().keys({
    name: JOI.string().required().label("Name"),
    phone_number: JOI.string().required().label("Phone number"),
    email: JOI.string().email().required().label("Email"),
    country: JOI.number().required().label("Country"),
    state: JOI.number().required().label("State"),
    city: JOI.number().required().label("City"),
    // address: JOI.string().required().min(30).max(250).label("Address"),
    address: JOI.string().required().min(10).max(30).label("Address"),
    notes: JOI.string().min(10).max(250).allow(null, "").label("Notes"),
    isPickupFromStore: JOI.any().required().label("Delivery type"),
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
    shippingCost: JOI.number().required().label("Shipping cost"),
    totalAmount: JOI.number().required().label("Total cost"),
    totalDiscount: JOI.number().required().label("Total discount"),
    totalTax: JOI.number().required().label("Total tax"),
    tax: JOI.number().required().label("Tax"),
    finalTotal: JOI.number().required().label("Final price"),
    promocode: JOI.string().required().allow("", null).label("Promocode"),
    discountType: JOI.number()
      .required()
      .allow("", null)
      .label("Discount type"),
    discount: JOI.number().required().allow("", null).label("Discount"),
    paymentMethod: JOI.number().required().label("Payment method"),
    cartId: JOI.number().required().label("Cart ID"),
  }),
};

exports.validatePaymentStatusSchema = {
  body: JOI.object().keys({
    paymentId: JOI.string().required().label("Payment ID"),
    id: JOI.string().required().label("ID"),
    type: JOI.number().required().label("Type"),
  }),
};
