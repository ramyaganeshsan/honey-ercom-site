const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shipping_info', {
    shipping_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    shipping_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1- product , 2 auction"
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tracking: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    adderss1: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    address2: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    shipping_date: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    delivery_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Pending,1-order packed,2-Shipped to center,3-Out of delivery,4-Delivered,5-Failed,6-Cancelled,7-Returned"
    }
  }, {
    sequelize,
    tableName: 'shipping_info',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shipping_id" },
        ]
      },
    ]
  });
};
