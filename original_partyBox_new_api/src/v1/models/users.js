const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
    {
      user_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      firstname: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      firstname_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      lastname_french: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      fb_user_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      fb_session_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      twitter_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      twitter_access_token: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      twitter_secret_token: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address1: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address2: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      dob: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      city_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      my_favouites: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      payment_account_id: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      user_referral_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      merchant_account_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      merchant_commission: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: "merchant commission",
      },
      referral_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      referred_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deal_bought_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4,
        comment: "1-Website-Admin, 2-CityAdmin, 3-Merchant, 4-users",
      },
      user_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-active,0-deactive",
      },
      login_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-direct, 2-admin, 3-facebook, 4-twitter",
      },
      joined_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      last_login: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      facebook_update: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "1-active 0-Dactive",
      },
      approve_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1-approve,0-disapprove",
      },
      wishlist: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ship_name: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      ship_address1: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      ship_address2: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      ship_state: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      ship_country: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ship_city: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ship_mobileno: {
        type: DataTypes.STRING(24),
        allowNull: false,
      },
      ship_zipcode: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      AccountCountryCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      AccountEntity: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      AccountNumber: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      AccountPin: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      UserName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      ShippingPassword: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      flat_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      change_password_must: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      gender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "1-Male,2-Female",
      },
      gplus_id: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      gplus_access_token: {
        type: DataTypes.STRING(256),
        allowNull: false,
      },
      about_us: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fbid: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      login_count: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "stores the count of login",
      },
      refference_key: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_guest: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: "1-yes, 0-no",
      },
      user_reg_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0-registration, 1-guest",
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "user_id",
          using: "BTREE",
          fields: [
            { name: "user_id" },
            { name: "firstname" },
            { name: "email" },
          ],
        },
      ],
    }
  );
};
