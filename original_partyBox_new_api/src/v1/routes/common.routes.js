const express = require("express");
const commonRoutes = express.Router();

const {
  getStatesAndCountries,
  addCountriesAndStates,
  sending_email,
} = require("../controller/common.controller");

commonRoutes.get("/states_and_cities", getStatesAndCountries);
commonRoutes.post("/states_and_cities", addCountriesAndStates);

module.exports = commonRoutes;
