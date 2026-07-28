const tableConfig = require("../database/table.config.json");

exports.getOutOfStockProductDetails = async (minimumQuantity) => {
  let query = `SELECT 
        deal_title as productName,
        ${tableConfig.sub_products}.quantity,
        ${tableConfig.size}.size_name as sizeName
    FROM ${tableConfig.sub_products}
    LEFT JOIN product ON product.deal_id = ${tableConfig.sub_products}.product_id
    LEFT JOIN ${tableConfig.size} ON ${tableConfig.size}.size_id = ${tableConfig.sub_products}.size_id
    WHERE ${tableConfig.sub_products}.quantity < ${minimumQuantity};`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  return response;
};
