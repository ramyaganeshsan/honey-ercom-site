const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_size', {
    product_size_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    deal_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size_name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size_ids: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'product_size',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_size_id" },
        ]
      },
      {
        name: "deal_id",
        using: "BTREE",
        fields: [
          { name: "deal_id" },
          { name: "size_id" },
        ]
      },
    ]
  });
};
