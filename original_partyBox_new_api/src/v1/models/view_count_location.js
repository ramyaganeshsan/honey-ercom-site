const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_count_location', {
    view_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    deal_key: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    product_key: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    auction_key: {
      type: DataTypes.STRING(35),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    date: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'view_count_location',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "view_id" },
        ]
      },
      {
        name: "product_key",
        using: "BTREE",
        fields: [
          { name: "product_key" },
          { name: "ip" },
        ]
      },
    ]
  });
};
