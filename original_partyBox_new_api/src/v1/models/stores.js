const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stores', {
    store_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    store_name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING(35),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(35),
      allowNull: false
    },
    store_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    store_name_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    store_url_title: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    store_key: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address1: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    address2: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    address1_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address2_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    store_state_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    zipcode: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    website: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    meta_keywords: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    meta_description: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    meta_keywords_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    meta_description_french: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    latitude: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    longitude: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    store_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-Main, 2 - Branch"
    },
    merchant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    store_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'stores',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "store_id" },
        ]
      },
      {
        name: "store_id",
        using: "BTREE",
        fields: [
          { name: "store_id" },
          { name: "store_name" },
        ]
      },
    ]
  });
};
