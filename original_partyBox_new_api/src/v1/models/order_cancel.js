const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_cancel', {
    order_cancel_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cart_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    amount: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cancel_process: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1 - Auto\/ 2 - Manual"
    },
    process_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1 - Reproduct, 2 -Wallet, 3 - Bank transfer"
    },
    cancel_approved_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1 - Admin, 2 - Admin \/ Merchant"
    },
    cancel_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1 - Cancel, 2 - Return"
    },
    cancel_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0 - Pending, 1 - Approved, - Not approved"
    },
    cancelled_on: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_type: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'order_cancel',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_cancel_id" },
        ]
      },
      {
        name: "order_cancel_id",
        using: "BTREE",
        fields: [
          { name: "order_cancel_id" },
        ]
      },
    ]
  });
};
