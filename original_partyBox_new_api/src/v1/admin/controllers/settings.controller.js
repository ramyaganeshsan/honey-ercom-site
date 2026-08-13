const { findOne, updateOne, create, getModel } = require("../../mongo/repo");
const { ok, fail } = require("../services/admin.helpers");

exports.getSettings = async (req, res) => {
  try {
    const settings = await findOne("settings", {});
    if (!settings) {
      return res.send(fail("Settings not found"));
    }
    return res.send(ok(settings));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load settings"));
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    delete body._id;

    let settings = await findOne("settings", {});
    if (!settings) {
      const created = await create("settings", { id: 1, ...body });
      return res.send(ok(created, "Settings created"));
    }

    // Prefer numeric id; fall back to updating first doc via model
    let updated = null;
    if (settings.id != null) {
      updated = await updateOne("settings", { id: settings.id }, body);
    }
    if (!updated) {
      const Model = getModel("settings");
      updated = await Model.findOneAndUpdate(
        {},
        { $set: body },
        { new: true, lean: true }
      );
      if (updated) {
        const { _id, __v, ...rest } = updated;
        updated = rest;
      }
    }

    if (!updated) {
      return res.send(fail("Failed to update settings"));
    }
    return res.send(ok(updated, "Settings updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update settings"));
  }
};
