const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banner_image', {
    banner_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    image_title: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    image_title_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image_info_french: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_info: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    redirect_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    home: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-Active,0-Deactive"
    }
  }, {
    sequelize,
    tableName: 'banner_image',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "banner_id" },
        ]
      },
      {
        name: "banner_id",
        using: "BTREE",
        fields: [
          { name: "banner_id" },
          { name: "image_title" },
          { name: "position" },
          { name: "product" },
        ]
      },
    ]
  });
};
