const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('package_account_transaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    invoice_ref_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    business_name: {
      type: DataTypes.STRING(70),
      allowNull: false
    },
    package_type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subscription_cost: {
      type: DataTypes.DOUBLE(10,2),
      allowNull: false
    },
    setup_cost: {
      type: DataTypes.DOUBLE(10,2),
      allowNull: false
    },
    service_tax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_tax_cost: {
      type: DataTypes.DOUBLE(10,2),
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE(10,2),
      allowNull: false
    },
    payment_terms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createddate: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expirydate: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    paid_status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    txnID: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ePGTxnID: {
      type: DataTypes.STRING(70),
      allowNull: false
    },
    currency: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    responsecode: {
      type: DataTypes.STRING(70),
      allowNull: false
    },
    response_msg: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pay_mode: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'package_account_transaction',
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
