const repl = require("repl");
const sequelize = require("sequelize");
const models = require("../models");

global.Op = sequelize.Op;

Object.keys(models).forEach((modelName) => {
  global[modelName] = models[modelName];
});

const replServer = repl.start({
  prompt: "Honey E-commerce > ",
});

replServer.context.db = models;
