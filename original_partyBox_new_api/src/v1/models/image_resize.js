const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('image_resize', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    list_width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    list_height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    detail_width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    detail_height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    thumb_width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    thumb_height: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'image_resize',
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
    ]
  });
};
