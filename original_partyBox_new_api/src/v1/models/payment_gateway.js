const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "payment_gateway",
    {
      payment_gateway_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      payment_gatway: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      default_payment_gateway: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_gateway_username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      payment_gateway_password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      payment_gateway_signature: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      live_payment_gateway_username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      live_payment_gateway_password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      live_payment_gateway_signature: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "payment_gateway",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "payment_gateway_id" }],
        },
      ],
    }
  );
};
