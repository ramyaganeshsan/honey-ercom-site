const Sequelize = require("sequelize");
const { Model } = require("sequelize");
const { PRODUCT_DISPLAY_IMAGE } = require("../utils/constants");

module.exports = function (sequelize, DataTypes) {
  class product extends Model {
    static associate(models) {
      product.hasMany(models.cart_items, { foreignKey: "deal_id" });
      product.hasMany(models.rate_review, { foreignKey: "type_id" });
    }
  }

  product.init(
    {
      deal_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      deal_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      deal_title_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url_title: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      deal_key: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      deal_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deal_description_french: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      terms_conditions: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      meta_keywords: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      meta_description_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      meta_keywords_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      category_ids: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sub_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sec_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      third_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deal_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-deals, 2-products, 3 - Auction",
      },
      deal_value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      deal_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      deal_savings: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      deal_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      purchase_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_limit_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      inStock: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.user_limit_quantity > 0;
        },
      },
      image: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${PRODUCT_DISPLAY_IMAGE}${this.deal_key}_1.png`;
        },
      },
      ratings: {
        type: DataTypes.VIRTUAL,
        get() {
          let rating = 5;
          if (this.rate_reviews && this.rate_reviews?.length > 0) {
            let total = 0;
            this?.rate_reviews?.forEach((review) => {
              total += review.rating;
            });
            if (!Number.isInteger(total) || total > 5) {
              rating = Math.round(total / this.rate_reviews?.length);
            } else {
              rating = total;
            }
          }
          return rating > 5 ? 5 : rating;
        },
      },
      created_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deal_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-active,0-deactive",
      },
      delivery_period: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attribute: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-Yes,0-No",
      },
      deal_feature: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      combo_products: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      combo_price: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tags: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cat_tags: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      related_products: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      is_customized: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      having_size_color: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      merchant_id: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      shipping: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      brand_names: {
        type: DataTypes.STRING(150),
        allowNull: false,
        defaultValue: "",
      },
      supplier_names: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ballon_filling_option: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "product",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "deal_id" }],
        },
        {
          name: "deal_id",
          using: "BTREE",
          fields: [
            { name: "deal_id" },
            { name: "deal_title" },
            { name: "deal_key" },
          ],
        },
        {
          name: "deal_id_2",
          using: "BTREE",
          fields: [{ name: "deal_id" }],
        },
        {
          name: "brand_id",
          using: "BTREE",
          fields: [{ name: "brand_id" }],
        },
        {
          name: "category_ids",
          using: "BTREE",
          fields: [{ name: "category_ids" }],
        },
        {
          name: "merchant_id",
          using: "BTREE",
          fields: [{ name: "merchant_id" }],
        },
        {
          name: "deal_id_3",
          using: "BTREE",
          fields: [{ name: "deal_id" }],
        },
      ],
    }
  );
  return product;
};
