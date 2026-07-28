const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cms', {
    cms_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cms_title: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    cms_title_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cms_url: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    cms_desc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cms_desc_french: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cms_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-active, 0-deactive"
    }
  }, {
    sequelize,
    tableName: 'cms',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cms_id" },
        ]
      },
      {
        name: "cms_id",
        using: "BTREE",
        fields: [
          { name: "cms_id" },
          { name: "cms_url" },
        ]
      },
    ]
  });
};
