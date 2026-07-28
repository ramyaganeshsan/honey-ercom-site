const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  class city extends Model {
    static associate(models) {
      city.belongsTo(models.country, { foreignKey: "country_id" });
    }
  }

  city.init(
    {
      city_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      city_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city_name_french: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city_url: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      delivery_charge: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
      },
      city_latitude: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      city_longitude: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      default: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      city_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-active, 0-deactive",
      },
      stateid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "city",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "city_id" }],
        },
        {
          name: "city_id",
          using: "BTREE",
          fields: [{ name: "city_id" }],
        },
        {
          name: "country_id",
          using: "BTREE",
          fields: [{ name: "country_id" }],
        },
      ],
    }
  );
  return city;
};
