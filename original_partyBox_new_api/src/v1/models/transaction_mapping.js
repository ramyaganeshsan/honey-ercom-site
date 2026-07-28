const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transaction_mapping', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    deal_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    auction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    coupon_code: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    transaction_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coupon_code_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    friend_name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    friend_email: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    product_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_color: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coupen_apply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    coupon_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wallet_apply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wallet_amount: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'transaction_mapping',
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
