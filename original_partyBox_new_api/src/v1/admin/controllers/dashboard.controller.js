const { count, findOne } = require("../../mongo/repo");
const { ok, fail } = require("../services/admin.helpers");

exports.getDashboard = async (req, res) => {
  try {
    const settings = await findOne("settings", {});
    const minQty =
      Number(settings?.minimumProductQuantityToNotify) > 0
        ? Number(settings.minimumProductQuantityToNotify)
        : 5;

    const [
      users,
      products,
      categories,
      transactions,
      completedCarts,
      pendingReviews,
      openContacts,
      lowStockProducts,
    ] = await Promise.all([
      count("users", { user_type: 4 }),
      count("product", {}),
      count("category", { category_status: { $ne: 0 } }),
      count("transaction", {}),
      count("cart", { cart_transaction_status: 1 }),
      count("rate_review", {
        $or: [{ approve_status: false }, { approve_status: 0 }],
      }),
      count("contact", { status: 1 }),
      count("product", {
        user_limit_quantity: { $lt: minQty },
        deal_status: { $ne: 0 },
      }),
    ]);

    const orders = transactions > 0 ? transactions : completedCarts;

    return res.send(
      ok({
        users,
        products,
        categories,
        orders,
        transactions,
        pendingReviews,
        openContacts,
        lowStockProducts,
        minimumProductQuantityToNotify: minQty,
      })
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load dashboard"));
  }
};
