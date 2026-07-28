const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute_group', {
    attribute_group_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    groupname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    groupname_french: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'attribute_group',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attribute_group_id" },
        ]
      },
      {
        name: "attribute_group_id",
        using: "BTREE",
        fields: [
          { name: "attribute_group_id" },
          { name: "groupname" },
        ]
      },
    ]
  });
};
