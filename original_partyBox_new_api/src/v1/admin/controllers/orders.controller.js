const { findOne, updateOne, count, findAll } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

async function useTransactionsAsOrders() {
  const txnCount = await count("transaction", {});
  return txnCount > 0;
}

exports.listOrders = async (req, res) => {
  try {
    if (await useTransactionsAsOrders()) {
      const filter = {};
      if (req.query.payment_status) {
        filter.payment_status = String(req.query.payment_status);
      }
      if (req.query.delivery_status !== undefined && req.query.delivery_status !== "") {
        filter.delivery_status = Number(req.query.delivery_status);
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

      // Attach cart when available
      const cartIds = [...new Set(data.items.map((t) => t.cart_id).filter(Boolean))];
      let cartsById = {};
      if (cartIds.length) {
        const carts = await findAll("cart", { cart_id: { $in: cartIds } });
        cartsById = Object.fromEntries(carts.map((c) => [c.cart_id, c]));
      }
      data.items = data.items.map((t) => ({
        ...t,
        cart: cartsById[t.cart_id] || null,
        source: "transaction",
      }));
      return res.send(ok(data));
    }

    const filter = { cart_transaction_status: 1 };
    if (req.query.user_id) {
      filter.user_id = Number(req.query.user_id);
    }
    if (req.query.payment_status !== undefined && req.query.payment_status !== "") {
      filter.payment_status = Number(req.query.payment_status);
    }

    const data = await listCollection("cart", filter, req.query, {
      order: [["order_date", "DESC"]],
    });
    data.items = data.items.map((c) => ({ ...c, source: "cart" }));
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list orders"));
  }
};

exports.getOrder = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.orderId);
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
      const related = await findAll("transaction", { cart_id: txn.cart_id });
      return res.send(ok({ ...txn, cart, items: related, source: "transaction" }));
    }

    const cart = await findOne("cart", {
      cart_id: id,
      cart_transaction_status: 1,
    });
    if (!cart) {
      return res.send(fail("Order not found"));
    }
    return res.send(ok({ ...cart, source: "cart" }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load order"));
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.orderId);
    const body = req.body || {};
    const allowed = {};
    for (const key of [
      "payment_status",
      "delivery_status",
      "admin_status",
      "tacking_id",
      "shipping_date",
      "shipping_log",
    ]) {
      if (body[key] !== undefined) {
        allowed[key] = body[key];
      }
    }
    if (!Object.keys(allowed).length) {
      return res.send(fail("No status fields provided"));
    }

    if (await useTransactionsAsOrders()) {
      const updated = await updateOne("transaction", { id }, allowed);
      if (!updated) {
        return res.send(fail("Order not found"));
      }
      // Mirror cart payment/delivery fields when present
      if (updated.cart_id) {
        const cartUpdate = {};
        if (body.payment_status !== undefined) {
          cartUpdate.payment_status =
            typeof body.payment_status === "number"
              ? body.payment_status
              : Number(body.payment_status) || updated.payment_status;
        }
        if (body.tacking_id !== undefined) {
          cartUpdate.tracking_id = body.tacking_id;
        }
        if (Object.keys(cartUpdate).length) {
          await updateOne("cart", { cart_id: updated.cart_id }, cartUpdate);
        }
      }
      return res.send(ok(updated, "Order status updated"));
    }

    const cartAllowed = {};
    if (body.payment_status !== undefined) {
      cartAllowed.payment_status = Number(body.payment_status);
    }
    if (body.tacking_id !== undefined || body.tracking_id !== undefined) {
      cartAllowed.tracking_id = body.tacking_id || body.tracking_id;
    }
    if (body.shipping_date !== undefined) {
      cartAllowed.shipping_date = Number(body.shipping_date);
    }
    if (body.shipping_log !== undefined) {
      cartAllowed.shipping_log = String(body.shipping_log);
    }
    const updated = await updateOne("cart", { cart_id: id }, cartAllowed);
    if (!updated) {
      return res.send(fail("Order not found"));
    }
    return res.send(ok(updated, "Order status updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update order"));
  }
};
