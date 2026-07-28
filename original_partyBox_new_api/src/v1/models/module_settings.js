const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('module_settings', {
    module_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    is_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_paypal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_credit_card: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_authorize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_cash_on_delivery: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_shipping: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1- Free Shipping ,  2- Flat Shipping, 3- Per Product Shipping , 4- Per Item Shipping"
    },
    is_map: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_store_list: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_faq: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_city: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_cms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-header position,0-footer position"
    },
    is_newsletter: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    free_shipping: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    flat_shipping: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    per_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    per_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_wallet: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_refund: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'module_settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "module_id" },
        ]
      },
    ]
  });
};
