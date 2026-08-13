const { findOne, updateOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

exports.listTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.user_id) {
      filter.user_id = Number(req.query.user_id);
    }
    if (req.query.payment_status) {
      filter.payment_status = String(req.query.payment_status);
    }
    if (req.query.cart_id) {
      filter.cart_id = Number(req.query.cart_id);
    }
    const q = String(req.query.search || req.query.q || "").trim();
    if (q) {
      const rx = { $regex: q, $options: "i" };
      filter.$or = [
        { email: rx },
        { transaction_id: rx },
        { firstname: rx },
        { lastname: rx },
        { phone: rx },
      ];
    }

    const data = await listCollection("transaction", filter, req.query, {
      order: [["order_date", "DESC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list transactions"));
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.transactionId);
    const txn =
      (await findOne("transaction", { id })) ||
      (await findOne("transaction", { cart_id: id }));
    if (!txn) {
      return res.send(fail("Transaction not found"));
    }
    const cart = txn.cart_id
      ? await findOne("cart", { cart_id: txn.cart_id })
      : null;
    return res.send(ok({ ...txn, cart }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load transaction"));
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const id = Number(req.params.id || req.params.transactionId);
    const body = { ...(req.body || {}) };
    delete body.id;
    delete body._id;

    const updated = await updateOne("transaction", { id }, body);
    if (!updated) {
      return res.send(fail("Transaction not found"));
    }
    return res.send(ok(updated, "Transaction updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update transaction"));
  }
};
