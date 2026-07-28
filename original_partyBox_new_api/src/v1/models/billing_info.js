const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('billing_info', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    purchase_inv_id: {
      type: DataTypes.STRING(50),
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
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    cardnumber: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    expiry_month: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    expiry_year: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cvv: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    createddate: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'billing_info',
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
        name: "id",
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "purchase_inv_id" },
          { name: "firstname" },
          { name: "city" },
          { name: "state" },
          { name: "country" },
        ]
      },
    ]
  });
};
