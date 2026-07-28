const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute', {
    attribute_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    name_french: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    attribute_group: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'attribute',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attribute_id" },
        ]
      },
      {
        name: "attribute_id",
        using: "BTREE",
        fields: [
          { name: "attribute_id" },
          { name: "name" },
        ]
      },
    ]
  });
};
