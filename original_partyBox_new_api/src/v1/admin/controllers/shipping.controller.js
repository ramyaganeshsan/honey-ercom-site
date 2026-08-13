const { findOne, create, updateOne, findAll } = require("../../mongo/repo");
const { ok, fail, failFromError, listCollection } = require("../services/admin.helpers");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

/* ---- Countries ---- */
exports.listCountries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.country_status !== undefined && req.query.country_status !== "") {
      filter.country_status = Number(req.query.country_status);
    }
    if (req.query.page || req.query.limit) {
      const data = await listCollection("country", filter, req.query, {
        order: [["country_name", "ASC"]],
      });
      return res.send(ok(data));
    }
    const items = await findAll("country", filter, {
      order: [["country_name", "ASC"]],
    });
    return res.send(ok({ items, total: items.length }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list countries"));
  }
};

exports.createCountry = async (req, res) => {
  try {
    const body = req.body || {};
    const country_name = String(body.country_name || "").trim();
    if (!country_name) {
      return res.send(fail("country_name is required"));
    }
    const item = await create("country", {
      country_name,
      country_name_french: String(body.country_name_french || country_name),
      country_code: String(body.country_code || ""),
      country_url: String(body.country_url || slugify(country_name)),
      country_status: body.country_status !== undefined ? Number(body.country_status) : 1,
      currency_symbol: String(body.currency_symbol || "AED"),
      currency_code: String(body.currency_code || "AED"),
      ISO_country_code: String(body.ISO_country_code || body.country_code || ""),
    });
    return res.send(ok(item, "Country created"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to create country"));
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const countryId = Number(req.params.countryId);
    const body = { ...(req.body || {}) };
    delete body.country_id;
    delete body._id;
    const updated = await updateOne("country", { country_id: countryId }, body);
    if (!updated) {
      return res.send(fail("Country not found"));
    }
    return res.send(ok(updated, "Country updated"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to update country"));
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    const countryId = Number(req.params.countryId);
    const updated = await updateOne(
      "country",
      { country_id: countryId },
      { country_status: 0 }
    );
    if (!updated) {
      return res.send(fail("Country not found"));
    }
    return res.send(ok(updated, "Country deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete country"));
  }
};

/* ---- States ---- */
exports.listStates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.country_id) {
      filter.state_country_id = Number(req.query.country_id);
    }
    if (req.query.statestatus !== undefined && req.query.statestatus !== "") {
      filter.statestatus = Number(req.query.statestatus);
    }
    if (req.query.page || req.query.limit) {
      const data = await listCollection("state", filter, req.query, {
        order: [["state_name", "ASC"]],
      });
      return res.send(ok(data));
    }
    const items = await findAll("state", filter, {
      order: [["state_name", "ASC"]],
    });
    return res.send(ok({ items, total: items.length }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list states"));
  }
};

exports.createState = async (req, res) => {
  try {
    const body = req.body || {};
    const state_name = String(body.state_name || "").trim();
    if (!state_name) {
      return res.send(fail("state_name is required"));
    }
    const item = await create("state", {
      state_name,
      state_name_arabic: String(body.state_name_arabic || state_name),
      state_url: String(body.state_url || slugify(state_name)),
      state_country_id: Number(body.state_country_id || body.country_id) || 0,
      statestatus: body.statestatus !== undefined ? Number(body.statestatus) : 1,
    });
    return res.send(ok(item, "State created"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to create state"));
  }
};

exports.updateState = async (req, res) => {
  try {
    const stateId = Number(req.params.stateId);
    const body = { ...(req.body || {}) };
    delete body.state_id;
    delete body._id;
    const updated = await updateOne("state", { state_id: stateId }, body);
    if (!updated) {
      return res.send(fail("State not found"));
    }
    return res.send(ok(updated, "State updated"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to update state"));
  }
};

exports.deleteState = async (req, res) => {
  try {
    const stateId = Number(req.params.stateId);
    const updated = await updateOne(
      "state",
      { state_id: stateId },
      { statestatus: 0 }
    );
    if (!updated) {
      return res.send(fail("State not found"));
    }
    return res.send(ok(updated, "State deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete state"));
  }
};

/* ---- Cities ---- */
exports.listCities = async (req, res) => {
  try {
    const filter = {};
    if (req.query.country_id) {
      filter.country_id = Number(req.query.country_id);
    }
    if (req.query.state_id || req.query.stateid) {
      filter.stateid = Number(req.query.state_id || req.query.stateid);
    }
    if (req.query.city_status !== undefined && req.query.city_status !== "") {
      filter.city_status = Number(req.query.city_status);
    }
    if (req.query.page || req.query.limit) {
      const data = await listCollection("city", filter, req.query, {
        order: [["city_name", "ASC"]],
      });
      return res.send(ok(data));
    }
    const items = await findAll("city", filter, {
      order: [["city_name", "ASC"]],
    });
    return res.send(ok({ items, total: items.length }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list cities"));
  }
};

exports.createCity = async (req, res) => {
  try {
    const body = req.body || {};
    const city_name = String(body.city_name || "").trim();
    if (!city_name) {
      return res.send(fail("city_name is required"));
    }
    const item = await create("city", {
      city_name,
      city_name_french: String(body.city_name_french || city_name),
      city_url: String(body.city_url || slugify(city_name)),
      country_id: Number(body.country_id) || 0,
      stateid: Number(body.stateid || body.state_id) || 0,
      delivery_charge: Number(body.delivery_charge) || 0,
      city_latitude: String(body.city_latitude || ""),
      city_longitude: String(body.city_longitude || ""),
      default: Number(body.default) || 0,
      city_status: body.city_status !== undefined ? Number(body.city_status) : 1,
    });
    return res.send(ok(item, "City created"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to create city"));
  }
};

exports.updateCity = async (req, res) => {
  try {
    const cityId = Number(req.params.cityId);
    const body = { ...(req.body || {}) };
    delete body.city_id;
    delete body._id;
    if (body.state_id !== undefined && body.stateid === undefined) {
      body.stateid = Number(body.state_id);
      delete body.state_id;
    }
    const updated = await updateOne("city", { city_id: cityId }, body);
    if (!updated) {
      return res.send(fail("City not found"));
    }
    return res.send(ok(updated, "City updated"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to update city"));
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const cityId = Number(req.params.cityId);
    const updated = await updateOne(
      "city",
      { city_id: cityId },
      { city_status: 0 }
    );
    if (!updated) {
      return res.send(fail("City not found"));
    }
    return res.send(ok(updated, "City deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete city"));
  }
};
