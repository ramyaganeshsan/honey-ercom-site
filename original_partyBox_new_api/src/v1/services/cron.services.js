const { findAll } = require("../mongo/repo");

exports.getOutOfStockProductDetails = async (minimumQuantity) => {
  const subProducts = await findAll(
    "sub_products",
    { quantity: { $lt: Number(minimumQuantity) } },
    {
      attributes: ["product_id", "quantity", "size_id"],
    }
  );

  if (!subProducts.length) {
    return [];
  }

  const productIds = [...new Set(subProducts.map((s) => s.product_id))];
  const sizeIds = [...new Set(subProducts.map((s) => s.size_id))];

  const [products, sizes] = await Promise.all([
    findAll(
      "product",
      { deal_id: { $in: productIds } },
      { attributes: ["deal_id", "deal_title"] }
    ),
    findAll(
      "size",
      { size_id: { $in: sizeIds } },
      { attributes: ["size_id", "size_name"] }
    ),
  ]);

  const productMap = Object.fromEntries(
    products.map((p) => [p.deal_id, p.deal_title])
  );
  const sizeMap = Object.fromEntries(
    sizes.map((s) => [s.size_id, s.size_name])
  );

  // LEFT JOIN product / size — include rows even when names are missing
  return subProducts.map((sub) => ({
    productName: productMap[sub.product_id] ?? null,
    quantity: sub.quantity,
    sizeName: sizeMap[sub.size_id] ?? null,
  }));
};
