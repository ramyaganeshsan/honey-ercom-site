const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_count_location_bkup', {
    view_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    deal_key: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    product_key: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    auction_key: {
      type: DataTypes.STRING(35),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    date: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'view_count_location_bkup',
    timestamps: false
  });
};
