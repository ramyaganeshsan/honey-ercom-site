const { findOne, create, updateOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

exports.listBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status !== undefined && req.query.status !== "") {
      filter.status = Number(req.query.status);
    }
    if (req.query.home !== undefined && req.query.home !== "") {
      filter.home = Number(req.query.home);
    }
    const data = await listCollection("banner_image", filter, req.query, {
      order: [["position", "ASC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list banners"));
  }
};

exports.getBanner = async (req, res) => {
  try {
    const item = await findOne("banner_image", {
      banner_id: Number(req.params.bannerId),
    });
    if (!item) {
      return res.send(fail("Banner not found"));
    }
    return res.send(ok(item));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load banner"));
  }
};

exports.createBanner = async (req, res) => {
  try {
    const body = req.body || {};
    const image_title = String(body.image_title || "").trim();
    if (!image_title) {
      return res.send(fail("image_title is required"));
    }
    const item = await create("banner_image", {
      image_title,
      image_title_french: String(body.image_title_french || image_title),
      image_info: String(body.image_info || ""),
      image_info_french: String(body.image_info_french || ""),
      redirect_url: String(body.redirect_url || "/products"),
      position: Number(body.position) || 0,
      product: Number(body.product) || 0,
      home: body.home !== undefined ? Number(body.home) : 1,
      status: body.status !== undefined ? Number(body.status) : 1,
    });
    return res.send(ok(item, "Banner created"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to create banner"));
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const bannerId = Number(req.params.bannerId);
    const body = { ...(req.body || {}) };
    delete body.banner_id;
    delete body._id;
    const updated = await updateOne(
      "banner_image",
      { banner_id: bannerId },
      body
    );
    if (!updated) {
      return res.send(fail("Banner not found"));
    }
    return res.send(ok(updated, "Banner updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update banner"));
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = Number(req.params.bannerId);
    const updated = await updateOne(
      "banner_image",
      { banner_id: bannerId },
      { status: 0 }
    );
    if (!updated) {
      return res.send(fail("Banner not found"));
    }
    return res.send(ok(updated, "Banner deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete banner"));
  }
};
