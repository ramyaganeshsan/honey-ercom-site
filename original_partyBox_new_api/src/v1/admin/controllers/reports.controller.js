const { aggregate, count } = require("../../mongo/repo");
const { ok, fail } = require("../services/admin.helpers");

function parseDateRange(query = {}) {
  let from = query.from || query.start_date || query.startDate;
  let to = query.to || query.end_date || query.endDate;

  let fromTs = null;
  let toTs = null;

  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      fromTs = Math.floor(d.getTime() / 1000);
    } else if (!Number.isNaN(Number(from))) {
      fromTs = Number(from);
    }
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      // end of day if date-only string
      if (String(to).length <= 10) {
        d.setHours(23, 59, 59, 999);
      }
      toTs = Math.floor(d.getTime() / 1000);
    } else if (!Number.isNaN(Number(to))) {
      toTs = Number(to);
    }
  }

  // Default: last 30 days
  if (fromTs == null && toTs == null) {
    toTs = Math.floor(Date.now() / 1000);
    fromTs = toTs - 30 * 24 * 60 * 60;
  }

  return { fromTs, toTs };
}

exports.salesSummary = async (req, res) => {
  try {
    const { fromTs, toTs } = parseDateRange(req.query);
    const dateFilter = {};
    if (fromTs != null) dateFilter.$gte = fromTs;
    if (toTs != null) dateFilter.$lte = toTs;

    const txnMatch = {};
    if (Object.keys(dateFilter).length) {
      txnMatch.order_date = dateFilter;
    }

    const txnCount = await count("transaction", {});
    if (txnCount > 0) {
      const rows = await aggregate("transaction", [
        { $match: txnMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $toDate: { $multiply: ["$order_date", 1000] } },
              },
            },
            orders: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$grand_total", "$amount"] } },
            tax: { $sum: { $ifNull: ["$tax_amount", 0] } },
            shipping: { $sum: { $ifNull: ["$shipping_amount", 0] } },
            discount: { $sum: { $ifNull: ["$discount_amount", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const totals = rows.reduce(
        (acc, r) => {
          acc.orders += r.orders;
          acc.revenue += r.revenue;
          acc.tax += r.tax;
          acc.shipping += r.shipping;
          acc.discount += r.discount;
          return acc;
        },
        { orders: 0, revenue: 0, tax: 0, shipping: 0, discount: 0 }
      );

      return res.send(
        ok({
          source: "transaction",
          from: fromTs,
          to: toTs,
          totals,
          daily: rows.map((r) => ({
            date: r._id,
            orders: r.orders,
            revenue: r.revenue,
            tax: r.tax,
            shipping: r.shipping,
            discount: r.discount,
          })),
        })
      );
    }

    const cartMatch = { cart_transaction_status: 1 };
    if (Object.keys(dateFilter).length) {
      cartMatch.order_date = dateFilter;
    }

    const rows = await aggregate("cart", [
      { $match: cartMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: { $multiply: ["$order_date", 1000] } },
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$grand_total_price", 0] } },
          tax: { $sum: { $ifNull: ["$tax_amount", 0] } },
          shipping: { $sum: { $ifNull: ["$delivery_price", 0] } },
          discount: { $sum: { $ifNull: ["$discount_amount", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totals = rows.reduce(
      (acc, r) => {
        acc.orders += r.orders;
        acc.revenue += r.revenue;
        acc.tax += r.tax;
        acc.shipping += r.shipping;
        acc.discount += r.discount;
        return acc;
      },
      { orders: 0, revenue: 0, tax: 0, shipping: 0, discount: 0 }
    );

    return res.send(
      ok({
        source: "cart",
        from: fromTs,
        to: toTs,
        totals,
        daily: rows.map((r) => ({
          date: r._id,
          orders: r.orders,
          revenue: r.revenue,
          tax: r.tax,
          shipping: r.shipping,
          discount: r.discount,
        })),
      })
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to build sales report"));
  }
};
