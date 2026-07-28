const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cart_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payer_id: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    payer_status: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    country_code: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    currency_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    transaction_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    correlation_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    acknowledgement: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    recipt_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    transaction_type: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    payment_type: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    order_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    referral_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shipping_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    shipping_methods: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tax_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    payment_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pending_reason: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    reason_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    paypal_email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-CREDITCARD,2-PAYPAL, 3- REFER PAY, 4 - AUTHORIZE.NET,6-wallet"
    },
    captured: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "0-NO,1-YES"
    },
    captured_transaction_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    captured_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    captured_correlation_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    captured_ack: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    captured_payment_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    captured_payment_status: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    captured_pending_reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    friend_gift_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    deal_merchant_commission: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    merchant_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    coupon_mail_sent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    product_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_color: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    aramex_currencycode: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    merchantId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    serviceKey: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    itex_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    used_coupon_code: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    used_coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    discount_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    grand_total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    cart_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transfer_status: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    digital: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1-yes,0-no"
    },
    coupon_apply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    coupon_code: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    coupon_amount: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    coupon_percentage: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: ""
    },
    wallet_apply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wallet_amount: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: ""
    },
    package_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipping_information: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shipping_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    shipping_address: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    shipping_address1: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    shipping_phone: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    shipping_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipping_city: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    shipping_state: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    shipping_country: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    zip: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    tacking_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    shipping_date: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    shipping_log: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delivery_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Pending,1-order packed,2-Shipped to center,3-Out of delivery,4-Delivered,5-Failed,6-Cancelled,7-Returned"
    },
    admin_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'transaction',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "product_id" },
          { name: "transaction_id" },
        ]
      },
    ]
  });
};
