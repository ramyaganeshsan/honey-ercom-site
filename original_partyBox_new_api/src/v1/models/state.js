const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  class state extends Model {
    static associate(models) {
      state.belongsTo(models.country, { foreignKey: "state_country_id" });
    }
  }

  state.init(
    {
      state_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      state_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      state_name_arabic: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      state_url: {
        type: DataTypes.STRING(70),
        allowNull: false,
      },
      state_country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      statestatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "state",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "state_id" }],
        },
        {
          name: "state_id",
          using: "BTREE",
          fields: [{ name: "state_id" }, { name: "state_name" }],
        },
      ],
    }
  );
  return state;
};
