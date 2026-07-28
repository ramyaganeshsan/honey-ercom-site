const Sequelize = require("sequelize");
const { Model } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  class cart_items extends Model {
    static associate(models) {
      cart_items.belongsTo(models.product, { foreignKey: "deal_id" });
      // cart_items.belongsTo(models.sub_product, { foreignKey: "deal_id" });
    }
  }

  cart_items.init(
    {
      item_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cart",
          key: "cart_id",
        },
      },
      cart_userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_item_customized: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_color: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      item_color_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "0",
      },
      item_size: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      color_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      size_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      item_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_custom_details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      item_custom_image: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      deal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sub_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deal_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      deal_title_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      deal_key: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      deal_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deal_description_french: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      deal_value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      deal_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      deal_savings: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      deal_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      deal_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-active,0-deactive",
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      error_message: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      errors: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cart_transaction_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      admin_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivery_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      quantity_update_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      filling_option: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      filling_price: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: true,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      tableName: "cart_items",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "item_id" }],
        },
        {
          name: "item_id",
          using: "BTREE",
          fields: [
            { name: "item_id" },
            { name: "deal_title", length: 255 },
            { name: "deal_key" },
          ],
        },
        {
          name: "cart_id",
          using: "BTREE",
          fields: [{ name: "cart_id" }],
        },
      ],
    }
  );
  return cart_items;
};
