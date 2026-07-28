const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('brand_module_settings', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    filter_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    brand_logo_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'brand_module_settings',
    timestamps: false,
    indexes: [
      {
        name: "id",
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "filter_product" },
        ]
      },
    ]
  });
};
