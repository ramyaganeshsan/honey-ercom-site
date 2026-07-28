const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_access_token', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    access_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    access_key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    access_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    approved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0- Not approved; 1- Approved"
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0- not deleted 1- deleted"
    }
  }, {
    sequelize,
    tableName: 'users_access_token',
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
