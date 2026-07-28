const { getCurrentTime } = require("../utils");
const tableConfig = require("../database/table.config.json");

exports.validatePromocode = async (promocode) => {
  let query = `SELECT 
        discount,
        type,
        usage_count,
        usage_limit,
        minpromotype,
        minimum_total
    FROM ${tableConfig.promocodes} 
    WHERE 
        code = "${promocode}" 
        AND status = 1 
        AND starts_at <= DATE("${getCurrentTime().format(
          "YYYY-MM-DD hh:mm:ss"
        )}") 
        AND expires_at >= DATE("${getCurrentTime().format(
          "YYYY-MM-DD hh:mm:ss"
        )}");
    `;
  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });

  return response;
};
