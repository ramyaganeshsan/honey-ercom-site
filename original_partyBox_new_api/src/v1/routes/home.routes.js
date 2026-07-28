const express = require("express");
const homePageRouter = express.Router();

const { getHomePageContents } = require("../controller/home.controller");

homePageRouter.get("/", getHomePageContents);

module.exports = homePageRouter;
