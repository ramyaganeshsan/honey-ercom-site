const {
  parseData,
  getValueFromRedis,
  stringifyData,
  setValueRedis,
} = require("../utils");

exports.getCMSDetails = async (id) => {
  let newProducts = await getValueFromRedis("cms_about_us");
  if (newProducts) {
    let parsedResponse = parseData(newProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  let query = `SELECT cms_desc, cms_desc_french, cms_title, cms_title_french FROM cms WHERE cms_id = ${id}`;

  let response = await global?.SEQUELIZE?.query(query, {
    type: global?.SEQUELIZE?.QueryTypes?.SELECT,
  });
  console.log("response : ", response);
  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("cms_about_us", stringifyResponse.data, 1800); // 30 minutes
  }
  return response;
};
