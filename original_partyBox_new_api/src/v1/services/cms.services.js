const {
  parseData,
  getValueFromRedis,
  stringifyData,
  setValueRedis,
} = require("../utils");
const { findOne } = require("../mongo/repo");

exports.getCMSDetails = async (id) => {
  const cacheKey = `cms_page_${Number(id)}`;
  try {
    const cached = await getValueFromRedis(cacheKey);
    if (cached) {
      const parsedResponse = parseData(cached);
      if (
        parsedResponse?.status &&
        Array.isArray(parsedResponse?.data) &&
        parsedResponse.data.length > 0
      ) {
        return parsedResponse.data;
      }
    }
  } catch (_) {
    /* ignore cache errors */
  }

  const doc = await findOne(
    "cms",
    { cms_id: Number(id), cms_status: 1 },
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
  if (response.length > 0) {
    const stringifyResponse = stringifyData(response);
    if (stringifyResponse?.status) {
      await setValueRedis(cacheKey, stringifyResponse.data, 1800);
    }
  }
  return response;
};
