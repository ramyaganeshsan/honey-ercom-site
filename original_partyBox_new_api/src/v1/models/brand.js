const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "brand",
    {
      brand_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      brand_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      brand_name_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      brand_url: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      brand_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brand_description_french: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brand_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1 - Active, 0 - Inactive",
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: "0000-00-00 00:00:00",
      },
      brand_deal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      brand_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      brand_auction: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "brand",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "brand_id" }],
        },
        {
          name: "brand_id",
          using: "BTREE",
          fields: [
            { name: "brand_id" },
            { name: "brand_name" },
            { name: "brand_url" },
            { name: "brand_status" },
            { name: "brand_product" },
          ],
        },
        {
          name: "brand_id_2",
          using: "BTREE",
          fields: [{ name: "brand_id" }],
        },
      ],
    }
  );
};
