const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sms_otp",
    {
      otp_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_emailph: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: "Stored OTP value (hashed with md5 for verification)",
      },
      original_otp: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "Plain original OTP value for reference/audit",
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        comment: "1 - used; 0 - not used",
      },
      created_on: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "sms_otp",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "otp_id" }],
        },
      ],
    }
  );
};
