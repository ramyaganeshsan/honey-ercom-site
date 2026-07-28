const Sequelize = require("sequelize");
const { Model } = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  class rate_review extends Model {
    static associate(models) {
      rate_review.belongsTo(models.product, { foreignKey: "type_id" });
    }
  }

  rate_review.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      rating: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-deal,2-product,3-auction",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      review_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      review_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      approve_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        comment: "0 - Pending, 1 - Approved, 2 - Disapproved",
      },
      approved_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      created_date: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "rate_review",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "approved_user_id",
          using: "BTREE",
          fields: [{ name: "approved_user_id" }],
        },
      ],
    }
  );
  return rate_review;
};
