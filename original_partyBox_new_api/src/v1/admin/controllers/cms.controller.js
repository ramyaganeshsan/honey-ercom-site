const { findOne, create, updateOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "page";
}

exports.listCms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.cms_status !== undefined && req.query.cms_status !== "") {
      filter.cms_status = Number(req.query.cms_status);
    }
    const data = await listCollection("cms", filter, req.query, {
      order: [["cms_id", "ASC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list CMS pages"));
  }
};

exports.getCms = async (req, res) => {
  try {
    const item = await findOne("cms", { cms_id: Number(req.params.cmsId) });
    if (!item) {
      return res.send(fail("CMS page not found"));
    }
    return res.send(ok(item));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load CMS page"));
  }
};

exports.createCms = async (req, res) => {
  try {
    const body = req.body || {};
    const cms_title = String(body.cms_title || "").trim();
    if (!cms_title) {
      return res.send(fail("cms_title is required"));
    }
    const item = await create("cms", {
      cms_title,
      cms_title_french: String(body.cms_title_french || cms_title),
      cms_desc: String(body.cms_desc || ""),
      cms_desc_french: String(body.cms_desc_french || ""),
      cms_url: String(body.cms_url || slugify(cms_title)),
      type: Number(body.type) || 0,
      cms_status: body.cms_status !== undefined ? Number(body.cms_status) : 1,
    });
    return res.send(ok(item, "CMS page created"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to create CMS page"));
  }
};

exports.updateCms = async (req, res) => {
  try {
    const cmsId = Number(req.params.cmsId);
    const body = { ...(req.body || {}) };
    delete body.cms_id;
    delete body._id;
    const updated = await updateOne("cms", { cms_id: cmsId }, body);
    if (!updated) {
      return res.send(fail("CMS page not found"));
    }
    return res.send(ok(updated, "CMS page updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update CMS page"));
  }
};

exports.deleteCms = async (req, res) => {
  try {
    const cmsId = Number(req.params.cmsId);
    const updated = await updateOne(
      "cms",
      { cms_id: cmsId },
      { cms_status: 0 }
    );
    if (!updated) {
      return res.send(fail("CMS page not found"));
    }
    return res.send(ok(updated, "CMS page deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete CMS page"));
  }
};
