const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dummy_transaction', {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    order_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'dummy_transaction',
    timestamps: false
  });
};
