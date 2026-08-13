const { findAll, count, create, updateOne, deleteOne, findOne } = require("../../mongo/repo");

exports.ok = (data = null, message = "") => ({
  status: 1,
  message,
  data,
});

exports.fail = (message = "Request failed", status = 0) => ({
  status,
  message,
  data: null,
});

exports.parsePaging = (query = {}) => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 20;
  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

exports.listCollection = async (modelName, filter = {}, query = {}, options = {}) => {
  const { page, limit, skip } = exports.parsePaging(query);
  const [items, total] = await Promise.all([
    findAll(modelName, filter, {
      order: options.order || [["_id", "DESC"]],
      limit,
      offset: skip,
      attributes: options.attributes,
    }),
    count(modelName, filter),
  ]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

exports.repo = { findAll, count, create, updateOne, deleteOne, findOne };
