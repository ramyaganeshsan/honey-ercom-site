const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('blog_comments', {
    comments_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    website: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    comments: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    blogg_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approve_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1=>approved,0=>disapproved"
    },
    comments_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notify_comments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1=>yes,0=>no"
    },
    comments_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1=>active,0=>deactive"
    }
  }, {
    sequelize,
    tableName: 'blog_comments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "comments_id" },
        ]
      },
    ]
  });
};
