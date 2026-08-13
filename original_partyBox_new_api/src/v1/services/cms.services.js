const {
  parseData,
  getValueFromRedis,
  stringifyData,
  setValueRedis,
} = require("../utils");
const { findOne } = require("../mongo/repo");

exports.getCMSDetails = async (id) => {
  let newProducts = await getValueFromRedis("cms_about_us");
  if (newProducts) {
    let parsedResponse = parseData(newProducts);
    if (parsedResponse?.status) return parsedResponse?.data;
  }

  const doc = await findOne(
    "cms",
    { cms_id: Number(id) },
    {
      attributes: [
        "cms_desc",
        "cms_desc_french",
        "cms_title",
        "cms_title_french",
      ],
    }
  );

  const response = doc ? [doc] : [];
  console.log("response : ", response);
  let stringifyResponse = stringifyData(response);
  if (stringifyResponse?.status) {
    await setValueRedis("cms_about_us", stringifyResponse.data, 1800); // 30 minutes
  }
  return response;
};
