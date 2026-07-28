const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('module_settings_data', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    module_name: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    account_id: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    api_password: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    api_signature: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    transaction_key: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    api_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    payment_mode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    module_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    module_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    module_date: {
      type: DataTypes.STRING(16),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'module_settings_data',
    timestamps: false
  });
};
