/**
 * Thin Mongo helpers that mirror common Sequelize patterns used by services.
 * Returns plain objects (lean) so response shapes stay UI-compatible.
 */
const models = require("./models");

function getModel(name) {
  const model = models[name];
  if (!model) {
    throw new Error(`Unknown mongo model: ${name}`);
  }
  return model;
}

function projectAttributes(query, attributes) {
  if (!attributes || !attributes.length) return query;
  const projection = {};
  for (const key of attributes) {
    projection[key] = 1;
  }
  // Keep numeric PKs available when selected fields omit them accidentally
  return query.select(projection);
}

function applySort(query, order) {
  if (!order) return query;
  // Sequelize-style: [["col", "DESC"]] or Mongo { col: -1 }
  if (Array.isArray(order)) {
    const sort = {};
    for (const item of order) {
      if (Array.isArray(item) && item[0]) {
        sort[item[0]] = String(item[1] || "ASC").toUpperCase() === "DESC" ? -1 : 1;
      }
    }
    return query.sort(sort);
  }
  if (typeof order === "object") {
    return query.sort(order);
  }
  return query;
}

function stripMeta(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === "function") {
    doc = doc.toObject();
  }
  const { _id, __v, ...rest } = doc;
  return rest;
}

/**
 * @param {string} name model export name
 * @param {object} filter
 * @param {{ attributes?: string[], order?: any, lean?: boolean }} [options]
 */
async function findOne(name, filter = {}, options = {}) {
  const Model = getModel(name);
  let query = Model.findOne(filter);
  query = projectAttributes(query, options.attributes);
  query = applySort(query, options.order);
  const doc = await query.lean();
  return doc ? stripMeta(doc) : null;
}

/**
 * @param {string} name
 * @param {object} filter
 * @param {{ attributes?: string[], order?: any, limit?: number, offset?: number, skip?: number }} [options]
 */
async function findAll(name, filter = {}, options = {}) {
  const Model = getModel(name);
  let query = Model.find(filter);
  query = projectAttributes(query, options.attributes);
  query = applySort(query, options.order);
  if (options.offset != null || options.skip != null) {
    query = query.skip(Number(options.offset ?? options.skip) || 0);
  }
  if (options.limit != null) {
    query = query.limit(Number(options.limit) || 0);
  }
  const docs = await query.lean();
  return (docs || []).map(stripMeta);
}

async function count(name, filter = {}) {
  const Model = getModel(name);
  return Model.countDocuments(filter);
}

async function create(name, data) {
  const Model = getModel(name);
  const doc = await Model.create(data);
  return stripMeta(doc.toObject ? doc.toObject() : doc);
}

async function createMany(name, docs) {
  const Model = getModel(name);
  const created = await Model.insertMany(docs, { ordered: false });
  return created.map((d) => stripMeta(d.toObject ? d.toObject() : d));
}

async function updateOne(name, filter, update, options = {}) {
  const Model = getModel(name);
  const result = await Model.findOneAndUpdate(
    filter,
    { $set: update },
    { new: true, lean: true, ...options }
  );
  return result ? stripMeta(result) : null;
}

async function updateMany(name, filter, update) {
  const Model = getModel(name);
  return Model.updateMany(filter, { $set: update });
}

async function deleteOne(name, filter) {
  const Model = getModel(name);
  return Model.deleteOne(filter);
}

async function deleteMany(name, filter) {
  const Model = getModel(name);
  return Model.deleteMany(filter);
}

async function aggregate(name, pipeline) {
  const Model = getModel(name);
  return Model.aggregate(pipeline);
}

module.exports = {
  getModel,
  findOne,
  findAll,
  count,
  create,
  createMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  aggregate,
  stripMeta,
};
