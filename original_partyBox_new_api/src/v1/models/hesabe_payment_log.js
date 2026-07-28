const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hesabe_payment_log",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: "Payment status (1 - success 0 - failure )",
      },
      payment_token: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      payment_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      paid_on: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      method: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: "1 - KNET, 2 - MIGS",
      },
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tabby_installment_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tabby_installment_period: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tabby_payment_status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tamara_payment_mode: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tamara_payment_status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tamara_instalments_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "hesabe_payment_log",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
