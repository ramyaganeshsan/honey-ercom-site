import JOI from "joi";
import { t } from "i18next";

export const cancelOrderSchema = {
  cartId: JOI.number().required().label("Cart ID"),
  orderId: JOI.number().required().label("Order ID"),
  cancellationReason: JOI.string().required().label(t("cancel_reason")),
};
