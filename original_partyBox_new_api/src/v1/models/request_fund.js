const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('request_fund', {
    request_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-merchant request, 2-affiliate amount request"
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_comments: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    date_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    request_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-pending, 2-approved, 3-Rejected"
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1-success, 2-Failure"
    },
    transaction_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    error_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    error_title: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'request_fund',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "request_id" },
        ]
      },
    ]
  });
};
