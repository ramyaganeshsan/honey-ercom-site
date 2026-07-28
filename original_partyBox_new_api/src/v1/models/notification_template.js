const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notification_template', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email_from: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "hello@q8partybox.com"
    },
    template_index: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    send_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject_ar: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    template_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    template_content_ar: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'notification_template',
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
    ]
  });
};
