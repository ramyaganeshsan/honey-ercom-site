const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/adminAuth.middleware");
const shipping = require("../controllers/shipping.controller");

router.use(requireAdmin);

router.get("/countries", shipping.listCountries);
router.post("/countries", shipping.createCountry);
router.put("/countries/:countryId", shipping.updateCountry);
router.delete("/countries/:countryId", shipping.deleteCountry);

router.get("/states", shipping.listStates);
router.post("/states", shipping.createState);
router.put("/states/:stateId", shipping.updateState);
router.delete("/states/:stateId", shipping.deleteState);

router.get("/cities", shipping.listCities);
router.post("/cities", shipping.createCity);
router.put("/cities/:cityId", shipping.updateCity);
router.delete("/cities/:cityId", shipping.deleteCity);

module.exports = router;
