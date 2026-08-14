const { findOne, updateOne, count, findAll } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

async function useTransactionsAsOrders() {
  const txnCount = await count("transaction", {});
  return txnCount > 0;
}

/** Admin fulfillment statuses stored on cart.admin_status */
const ORDER_STATUS = {
  pending: 0,
  processing: 1,
  shipped: 2,
  completed: 3,
  cancelled: 4,
};

const ORDER_STATUS_LABEL = {
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Completed",
  4: "Cancelled",
};

function toFiniteNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseOrderStatus(input) {
  if (input === undefined || input === null || input === "") return null;
  if (typeof input === "number" && Number.isFinite(input)) {
    return ORDER_STATUS_LABEL[input] != null ? input : null;
  }
  const raw = String(input).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ORDER_STATUS, raw)) {
    return ORDER_STATUS[raw];
  }
  // Legacy UI labels that were incorrectly sent as payment_status
  if (raw === "paid") return ORDER_STATUS.processing;
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && ORDER_STATUS_LABEL[asNum] != null) {
    return asNum;
  }
  return null;
}

function paymentMethodLabel(order = {}) {
  if (
    Number(order.isCashOnDelivery) === 1 ||
    Number(order.type) === 5 ||
    Number(order.paymentMethod) === -1
  ) {
    return "Cash on delivery (COD)";
  }
  if (Number(order.isPaymentFromTabby) === 1) return "Tabby";
  if (Number(order.isPickupFromStore) === 1) return "Pickup from store";
  return "Online payment";
}

function paymentStatusLabel(order = {}) {
  if (Number(order.isCashOnDelivery) === 1) {
    return Number(order.paymentStatusCOD) === 1 || Number(order.payment_status) === 1
      ? "COD collected"
      : "COD pending";
  }
  return Number(order.payment_status) === 1 ? "Paid" : "Unpaid";
}

function normalizeCartItems(items = []) {
  return (items || []).map((item) => {
    const qty = toFiniteNumber(item.item_quantity ?? item.quantity, 1) || 1;
    const unit = toFiniteNumber(
      item.deal_price ?? item.currentPrice ?? item.price ?? item.deal_value,
      0
    );
    return {
      ...item,
      quantity: qty,
      item_quantity: qty,
      unit_price: unit,
      amount: unit * qty,
      deal_title: item.deal_title || item.title || item.product_name || `Deal #${item.deal_id}`,
      sku: item.sku || "",
    };
  });
}

async function enrichCartOrder(cart) {
  if (!cart) return null;
  const items = await findAll(
    "cart_items",
    { cart_id: Number(cart.cart_id) },
    { order: [["item_id", "ASC"]] }
  );
  const lineItems = normalizeCartItems(items);
  const adminStatus = toFiniteNumber(cart.admin_status, 0) ?? 0;
  const amount = toFiniteNumber(
    cart.grand_total_price ?? cart.grand_total ?? cart.total_cart_price,
    0
  );
  const shipping = toFiniteNumber(cart.delivery_price ?? cart.DHLshippingCost, 0);
  const subtotal = toFiniteNumber(cart.total_cart_price, 0);
  const tax = toFiniteNumber(cart.tax_amount, 0);
  const discount = toFiniteNumber(cart.discount_amount, 0);

  return {
    ...cart,
    source: "cart",
    order_id: cart.cart_id,
    id: cart.cart_id,
    amount,
    grand_total: amount,
    grand_total_price: amount,
    subtotal,
    tax_amount: tax,
    discount_amount: discount,
    shipping_amount: shipping,
    delivery_price: shipping,
    payment_method: paymentMethodLabel(cart),
    payment_status_label: paymentStatusLabel(cart),
    order_status: adminStatus,
    order_status_label: ORDER_STATUS_LABEL[adminStatus] || "Pending",
    status: ORDER_STATUS_LABEL[adminStatus] || "Pending",
    is_cod:
      Number(cart.isCashOnDelivery) === 1 || Number(cart.type) === 5 ? 1 : 0,
    customer_name: cart.shipping_name || "",
    phone: cart.shipping_phone || "",
    address: [cart.shipping_address, cart.shipping_address1]
      .filter(Boolean)
      .join(", "),
    items: lineItems,
    order_items: lineItems,
  };
}

exports.listOrders = async (req, res) => {
  try {
    if (await useTransactionsAsOrders()) {
      const filter = {};
      if (req.query.payment_status) {
        filter.payment_status = String(req.query.payment_status);
      }
      if (req.query.user_id) {
        filter.user_id = Number(req.query.user_id);
      }
      const q = String(req.query.search || req.query.q || "").trim();
      if (q) {
        const rx = { $regex: q, $options: "i" };
        filter.$or = [
          { email: rx },
          { firstname: rx },
          { lastname: rx },
          { transaction_id: rx },
          { phone: rx },
        ];
      }

      const data = await listCollection("transaction", filter, req.query, {
        order: [["order_date", "DESC"]],
      });

      const cartIds = [
        ...new Set(data.items.map((t) => t.cart_id).filter(Boolean)),
      ];
      let cartsById = {};
      if (cartIds.length) {
        const carts = await findAll("cart", { cart_id: { $in: cartIds } });
        cartsById = Object.fromEntries(carts.map((c) => [c.cart_id, c]));
      }
      data.items = await Promise.all(
        data.items.map(async (t) => {
          const cart = cartsById[t.cart_id] || null;
          const enriched = cart ? await enrichCartOrder(cart) : null;
          return {
            ...(enriched || {}),
            ...t,
            source: "transaction",
            amount:
              toFiniteNumber(t.grand_total ?? t.amount, null) ??
              enriched?.amount ??
              0,
            payment_method:
              enriched?.payment_method || paymentMethodLabel(t),
            order_status_label:
              enriched?.order_status_label ||
              ORDER_STATUS_LABEL[toFiniteNumber(t.admin_status, 0)] ||
              "Pending",
          };
        })
      );
      return res.send(ok(data));
    }

    const filter = { cart_transaction_status: 1 };
    if (req.query.user_id) {
      filter.user_id = Number(req.query.user_id);
    }
    if (req.query.payment_status !== undefined && req.query.payment_status !== "") {
      const n = toFiniteNumber(req.query.payment_status, null);
      if (n != null) filter.payment_status = n;
    }

    const data = await listCollection("cart", filter, req.query, {
      order: [["order_date", "DESC"]],
    });
    data.items = await Promise.all(
      data.items.map((c) => enrichCartOrder(c))
    );
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list orders"));
  }
};

exports.getOrder = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.orderId);
    if (!Number.isFinite(id)) {
      return res.send(fail("Invalid order id"));
    }

    if (await useTransactionsAsOrders()) {
      let txn =
        (await findOne("transaction", { id })) ||
        (await findOne("transaction", { cart_id: id }));
      if (!txn) {
        return res.send(fail("Order not found"));
      }
      const cart = txn.cart_id
        ? await findOne("cart", { cart_id: txn.cart_id })
        : null;
      const enriched = cart ? await enrichCartOrder(cart) : null;
      return res.send(
        ok({
          ...(enriched || {}),
          ...txn,
          cart,
          source: "transaction",
          amount:
            toFiniteNumber(txn.grand_total ?? txn.amount, null) ??
            enriched?.amount ??
            0,
          payment_method: enriched?.payment_method || paymentMethodLabel(txn),
          items: enriched?.items || [],
        })
      );
    }

    const cart = await findOne("cart", {
      cart_id: id,
      cart_transaction_status: 1,
    });
    if (!cart) {
      return res.send(fail("Order not found"));
    }
    return res.send(ok(await enrichCartOrder(cart)));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load order"));
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.orderId);
    if (!Number.isFinite(id)) {
      return res.send(fail("Invalid order id"));
    }

    const body = req.body || {};
    const cartUpdate = {};

    // Prefer explicit order_status / admin_status; map legacy string "status"
    const statusInput =
      body.order_status ?? body.admin_status ?? body.status ?? body.payment_status;
    const parsedStatus = parseOrderStatus(statusInput);
    if (statusInput !== undefined && statusInput !== null && statusInput !== "") {
      if (parsedStatus == null) {
        return res.send(
          fail(
            "Invalid status. Use Pending, Processing, Shipped, Completed, or Cancelled."
          )
        );
      }
      cartUpdate.admin_status = parsedStatus;
      if (parsedStatus === ORDER_STATUS.cancelled) {
        cartUpdate.is_cancel = 1;
      }
      if (parsedStatus === ORDER_STATUS.completed) {
        // Mark COD collected when completing a COD order
        cartUpdate.paymentStatusCOD = 1;
      }
    }

    // Only update numeric payment_status when a real number is provided
    if (body.payment_status !== undefined && body.payment_status !== null) {
      const pay = toFiniteNumber(body.payment_status, null);
      // Ignore non-numeric legacy strings like "Pending" that caused NaN CastError
      if (pay != null) {
        cartUpdate.payment_status = pay;
      }
    }

    if (body.paymentStatusCOD !== undefined) {
      const codPay = toFiniteNumber(body.paymentStatusCOD, null);
      if (codPay != null) cartUpdate.paymentStatusCOD = codPay;
    }

    if (body.tacking_id !== undefined || body.tracking_id !== undefined) {
      cartUpdate.tracking_id = String(body.tacking_id || body.tracking_id || "");
    }
    if (body.shipping_date !== undefined) {
      const sd = toFiniteNumber(body.shipping_date, null);
      if (sd != null) cartUpdate.shipping_date = sd;
    }
    if (body.shipping_log !== undefined) {
      cartUpdate.shipping_log = String(body.shipping_log);
    }

    if (!Object.keys(cartUpdate).length) {
      return res.send(fail("No status fields provided"));
    }

    if (await useTransactionsAsOrders()) {
      const txn =
        (await findOne("transaction", { id })) ||
        (await findOne("transaction", { cart_id: id }));
      if (!txn) {
        return res.send(fail("Order not found"));
      }
      const txnUpdate = {};
      if (cartUpdate.admin_status !== undefined) {
        txnUpdate.admin_status = cartUpdate.admin_status;
      }
      if (cartUpdate.payment_status !== undefined) {
        txnUpdate.payment_status = cartUpdate.payment_status;
      }
      if (Object.keys(txnUpdate).length) {
        await updateOne("transaction", { id: txn.id }, txnUpdate);
      }
      if (txn.cart_id) {
        await updateOne("cart", { cart_id: txn.cart_id }, cartUpdate);
      }
      const cart = txn.cart_id
        ? await findOne("cart", { cart_id: txn.cart_id })
        : null;
      return res.send(
        ok(cart ? await enrichCartOrder(cart) : txn, "Order status updated")
      );
    }

    const updated = await updateOne("cart", { cart_id: id }, cartUpdate);
    if (!updated) {
      return res.send(fail("Order not found"));
    }
    return res.send(ok(await enrichCartOrder(updated), "Order status updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail(err.message || "Failed to update order"));
  }
};
