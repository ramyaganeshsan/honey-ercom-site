const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('size', {
    size_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    category_attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category_attribute_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size_name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    size_name_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    main_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'size',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "size_id" },
        ]
      },
    ]
  });
};
