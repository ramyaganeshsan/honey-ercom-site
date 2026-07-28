const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('facebook_shop', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-Admin, 3-Merchant"
    },
    fb_uid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    fb_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fb_access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fb_pages_data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fb_connected_page: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'facebook_shop',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "fb_uid" },
        ]
      },
    ]
  });
};
