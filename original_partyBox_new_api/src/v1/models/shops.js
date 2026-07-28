const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shops', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    shop_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shop_days: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contact_number: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    latitude_longitude: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'shops',
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
