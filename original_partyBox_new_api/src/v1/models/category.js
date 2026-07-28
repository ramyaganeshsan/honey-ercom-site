const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "category",
    {
      category_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      main_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sub_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      category_name_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      category_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category_description_french: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      submenu_content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_url: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      category_icon: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      category_image: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      color_code: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      category_mapping: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      home_category_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      home_category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "1 - Yes, 0 - No",
      },
      category_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      product: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customize_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-customizeable,0-Non customize",
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1 - main , 2- 2layer , 3 - 3layer , 4 - 4layer",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menu_sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_list_title: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Only for main category",
      },
      category_list_description: {
        type: DataTypes.STRING(3000),
        allowNull: false,
        comment: "Only for main category",
      },
      category_list_image: {
        type: DataTypes.STRING(300),
        allowNull: false,
        comment: "Only for sub category",
      },
      home_banner_image: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: "For home page category image",
      },
      home_banner_url: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: "For homepage more button url",
      },
      discount_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "discount type",
      },
      discount_value: {
        type: DataTypes.DOUBLE(8, 3),
        allowNull: false,
        defaultValue: 0.0,
        comment: "discount value",
      },
    },
    {
      sequelize,
      tableName: "category",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "category_id" }],
        },
        {
          name: "subtypename",
          type: "FULLTEXT",
          fields: [{ name: "category_name" }],
        },
      ],
    }
  );
};
