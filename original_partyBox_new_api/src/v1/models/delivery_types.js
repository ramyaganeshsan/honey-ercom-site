const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('delivery_types', {
    Did: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Dname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Dname_french: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Ddays: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    terms_and_condition: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    terms_and_condition_french: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'delivery_types',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Did" },
        ]
      },
    ]
  });
};
