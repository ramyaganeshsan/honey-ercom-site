const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shipping_address', {
    shipping_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ship_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ship_mobileno: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    ship_address1: {
      type: DataTypes.STRING(2500),
      allowNull: false
    },
    ship_address2: {
      type: DataTypes.STRING(2500),
      allowNull: false
    },
    ship_city: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ship_state: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    ship_country: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ship_zipcode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ship_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    created_date: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    altphone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    landmark: {
      type: DataTypes.STRING(250),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'shipping_address',
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
