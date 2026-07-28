const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shipping_module_settings', {
    ship_module_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ship_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    free: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    flat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    per_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    per_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    aramex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'shipping_module_settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ship_module_id" },
        ]
      },
    ]
  });
};
