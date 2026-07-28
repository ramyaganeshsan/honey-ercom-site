const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('email_subscribe', {
    subscribe_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    email_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    country_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    city_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    category_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    gender: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0 - male, 1- female"
    },
    suscribe_city_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-Subscribe,0-Unsbscribe"
    },
    suscribe_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-subscribe,0-unsubscribe"
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'email_subscribe',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subscribe_id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "city_id" },
        ]
      },
    ]
  });
};
