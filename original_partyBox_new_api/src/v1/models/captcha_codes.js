const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('captcha_codes', {
    id: {
      type: DataTypes.STRING(40),
      allowNull: false,
      primaryKey: true
    },
    namespace: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    code_display: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    created: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    audio_data: {
      type: DataTypes.BLOB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'captcha_codes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
          { name: "namespace" },
        ]
      },
      {
        name: "created",
        using: "BTREE",
        fields: [
          { name: "created" },
        ]
      },
    ]
  });
};
