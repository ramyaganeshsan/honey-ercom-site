const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  class sub_products extends Model {
    static associate(models) {
      // sub_products.hasMany(models.cart_items, { foreignKey: "deal_id" });
      // sub_products.belongsTo(models.product, { foreignKey: "product_id" });
    }
  }
  sub_products.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      size_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      color_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      discount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      product_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      product_image: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      created_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sub_products",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "id",
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "product_id",
          using: "BTREE",
          fields: [{ name: "product_id" }],
        },
        {
          name: "size_id",
          using: "BTREE",
          fields: [{ name: "size_id" }],
        },
        {
          name: "color_id",
          using: "BTREE",
          fields: [{ name: "color_id" }],
        },
        {
          name: "product_key",
          using: "BTREE",
          fields: [{ name: "product_key" }],
        },
      ],
    }
  );
  return sub_products;
};
