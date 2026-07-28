const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "blog",
    {
      blog_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      blog_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      blog_title_french: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      url_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blog_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      blog_description_french: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      meta_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      meta_title_french: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      meta_description_french: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      meta_keywords: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      meta_keywords_french: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      tags: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      allow_comments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1=>yes, 0=>no",
      },
      comments_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blog_views: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blog_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      publish_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1=> published, 2=>draft",
      },
      blog_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1=>active, 0=>deactive",
      },
    },
    {
      sequelize,
      tableName: "blog",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "blog_id" }],
        },
      ],
    }
  );
};
