const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currency', {
    currency_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency_name: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    currency_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    currency_symbol: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    currency_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "0 - Not active, 1 - Active"
    },
    currency_default: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "0 - Not active, 1 - Active"
    }
  }, {
    sequelize,
    tableName: 'currency',
    timestamps: false
  });
};
