const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('blog_settings', {
    blog_settings_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    allow_comment_posting: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1=>yes, 2=>no"
    },
    require_adminapproval_comments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1=>yes, 2=>no"
    },
    posts_per_page: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4
    }
  }, {
    sequelize,
    tableName: 'blog_settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "blog_settings_id" },
        ]
      },
    ]
  });
};
