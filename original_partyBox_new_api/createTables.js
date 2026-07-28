require("dotenv").config();

const db = require("./src/v1/models");

(async () => {
  try {
    await db.sequelize.authenticate();

    console.log("CONNECTED");

    for (let key of Object.keys(db)) {
      try {
        if (key === "sequelize" || key === "Sequelize") {
          continue;
        }

        console.log("Creating :", key);

        await db[key].sync();

        console.log("SUCCESS");
      } catch (err) {
        console.log("----------------");

        console.log("FAILED :", key);

        console.log(err.message);

        console.log("----------------");
      }
    }
  } catch (err) {
    console.log(err);
  }
})();
