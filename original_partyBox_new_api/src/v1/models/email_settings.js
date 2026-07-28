const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('email_settings', {
    settings_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sendgrid_host: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    sendgrid_port: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sendgrid_username: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    sendgrid_password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    smtp_host: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    smtp_port: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    smtp_type: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: "ssl"
    },
    smtp_username: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    smtp_password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    api_key: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    list_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    replay_to_mail: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    from_name: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'email_settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "settings_id" },
        ]
      },
    ]
  });
};
