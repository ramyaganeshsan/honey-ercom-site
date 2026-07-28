const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ads_mgmt', {
    ads_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ads_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    ads_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ads_title_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ads_keyword: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ads_image: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ads_width: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    ads_height: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    redirect_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ads_mgmt',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ads_id" },
        ]
      },
    ]
  });
};
