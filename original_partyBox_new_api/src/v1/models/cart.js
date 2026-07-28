const Sequelize = require("sequelize");
const { Model } = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  class cart extends Model {
    static associate(models) {
      cart.hasMany(models.cart_items, { foreignKey: "cart_id" });
    }
  }
  cart.init(
    {
      cart_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      tax_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_cart_items: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_cart_price: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
      },
      cancel_amount: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      is_cancel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivery_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      delivery_price: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
      },
      delivery_period: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: "1",
      },
      delivery_terms: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      delivery_terms_arabic: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      grand_total_price: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
      },
      created_on: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cart_transaction_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tracking_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      shipping_name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      shipping_address: {
        type: DataTypes.STRING(2500),
        allowNull: false,
      },
      shipping_address1: {
        type: DataTypes.STRING(2500),
        allowNull: false,
      },
      shipping_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      shipping_city: {
        type: DataTypes.STRING(35),
        allowNull: false,
      },
      shipping_state: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      shipping_country: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      shipping_zip: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      shipping_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      transaction_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      billing_info: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "time in hrs",
      },
      order_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_log: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gateway_opened: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      gateway_opened_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      coupon_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      coupon_apply: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wallet_apply: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wallet_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      coupon_percentage: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: "0",
      },
      payment_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "0-Failed,1-success",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      isPaymentFromTabby: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      promocode_dump: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "cart",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "cart_id" }],
        },
        {
          name: "cart_id",
          using: "BTREE",
          fields: [{ name: "cart_id" }, { name: "user_id" }],
        },
      ],
    }
  );
  return cart;
};
