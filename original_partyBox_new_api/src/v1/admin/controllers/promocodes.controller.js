const { findOne, create, updateOne, deleteOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

exports.listPromocodes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status !== undefined && req.query.status !== "") {
      filter.status = Number(req.query.status);
    }
    const q = String(req.query.search || req.query.q || "").trim();
    if (q) {
      const rx = { $regex: q, $options: "i" };
      filter.$or = [{ code: rx }, { title: rx }];
    }
    const data = await listCollection("promocodes", filter, req.query, {
      order: [["id", "DESC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list promocodes"));
  }
};

exports.getPromocode = async (req, res) => {
  try {
    const item = await findOne("promocodes", { id: Number(req.params.id) });
    if (!item) {
      return res.send(fail("Promocode not found"));
    }
    return res.send(ok(item));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load promocode"));
  }
};

exports.createPromocode = async (req, res) => {
  try {
    const body = req.body || {};
    const code = String(body.code || "").trim();
    const title = String(body.title || "").trim();
    if (!code || !title) {
      return res.send(fail("code and title are required"));
    }
    const existing = await findOne("promocodes", { code });
    if (existing) {
      return res.send(fail("Promocode already exists"));
    }

    const item = await create("promocodes", {
      title,
      description: String(body.description || ""),
      status: body.status !== undefined ? Number(body.status) : 1,
      code,
      discount: Number(body.discount) || 0,
      type: Number(body.type) || 0,
      starts_at: body.starts_at ? new Date(body.starts_at) : undefined,
      expires_at: body.expires_at ? new Date(body.expires_at) : undefined,
      usage_limit: Number(body.usage_limit) || 0,
      usage_count: Number(body.usage_count) || 0,
      created_by: Number(req.adminDetails?.user_id) || 0,
      updated_by: Number(req.adminDetails?.user_id) || 0,
      user_ids: String(body.user_ids || ""),
      show_promo: Number(body.show_promo) || 0,
      minpromotype: Number(body.minpromotype) || 0,
      minimum_total: Number(body.minimum_total) || 0,
    });
    return res.send(ok(item, "Promocode created"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to create promocode"));
  }
};

exports.updatePromocode = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = { ...(req.body || {}) };
    delete body.id;
    delete body._id;
    body.updated_by = Number(req.adminDetails?.user_id) || 0;
    if (body.starts_at) body.starts_at = new Date(body.starts_at);
    if (body.expires_at) body.expires_at = new Date(body.expires_at);

    const updated = await updateOne("promocodes", { id }, body);
    if (!updated) {
      return res.send(fail("Promocode not found"));
    }
    return res.send(ok(updated, "Promocode updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update promocode"));
  }
};

exports.deletePromocode = async (req, res) => {
  try {
    const id = Number(req.params.id);
    // Soft delete preferred
    const updated = await updateOne("promocodes", { id }, { status: 0 });
    if (!updated) {
      await deleteOne("promocodes", { id });
      return res.send(ok(null, "Promocode deleted"));
    }
    return res.send(ok(updated, "Promocode deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete promocode"));
  }
};
