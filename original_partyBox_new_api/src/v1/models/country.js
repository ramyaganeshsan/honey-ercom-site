const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  class country extends Model {
    static associate(models) {
      country.hasMany(models.state, { foreignKey: "state_country_id" });
      country.hasMany(models.city, { foreignKey: "country_id" });
    }
  }

  country.init(
    {
      country_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      country_url: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      country_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      country_name_french: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      country_code: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      country_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-active,0-deactive",
      },
      currency_symbol: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      currency_code: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "country",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
        {
          name: "country_id",
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
      ],
    }
  );
  return country;
};
