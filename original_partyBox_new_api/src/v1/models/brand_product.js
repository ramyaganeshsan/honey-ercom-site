const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('brand_product', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    brand_productid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    brand_categoryid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    brand_sub_categoryid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-product,2-deal,3-auction"
    }
  }, {
    sequelize,
    tableName: 'brand_product',
    timestamps: false,
    indexes: [
      {
        name: "id",
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "brand_id" },
          { name: "brand_productid" },
          { name: "brand_categoryid" },
        ]
      },
    ]
  });
};
