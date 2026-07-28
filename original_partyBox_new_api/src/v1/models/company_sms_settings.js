const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('company_sms_settings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sms_account_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sms_auth_token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sms_from_number: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createddate: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'company_sms_settings',
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
      {
        name: "company_id",
        using: "BTREE",
        fields: [
          { name: "company_id" },
          { name: "sms_account_id" },
        ]
      },
    ]
  });
};
