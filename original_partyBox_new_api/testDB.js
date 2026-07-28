require("dotenv").config();

const db = require("./src/v1/models");

(async () => {
  try {
    await db.sequelize.authenticate();

    console.log("CONNECTED SUCCESSFULLY");
    console.log(Object.keys(db));
  } catch (err) {
    console.log(err);
  }
})();
