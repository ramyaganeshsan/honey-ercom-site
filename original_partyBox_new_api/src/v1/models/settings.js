const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('settings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hesabe_merchant_code: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    hesabe_payment_mode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "0-test, 1-live"
    },
    hesabe_payment_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hesabe_payment_description_arabic: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payment_description_arabic: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    site_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    site_name_french: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    title_french: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    meta_keywords: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    theme: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    default_language: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "english"
    },
    contact_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contact_email: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    webmaster_email: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    noreply_email: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    skype_id: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    address1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address2: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    zipcode: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phone1: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    phone2: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    facebook_page: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    instagram_page: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    twitter_page: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    linkedin_page: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    android_page: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    iphone_page: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    facebook_fanpage: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    youtube_url: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    analytics_code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    facebook_app_id: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    facebook_secret_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    twitter_api_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    twitter_secret_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    gmap_api_key: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    paypal_payment_mode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: " 0 - test account 1 - live account"
    },
    paypal_account_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    paypal_api_password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    paypal_api_signature: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    authorizenet_transaction_key: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    authorizenet_api_id: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    min_fund_request: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    max_fund_request: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    deal_commission: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency_symbol: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    currency_code: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    country_code: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    referral_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    site_mode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    latitude: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    longitude: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    email_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1-Sendgrid,2-Smtp,3-Mailchimp"
    },
    flat_shipping: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tax_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cancel_process: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1-Auto , 2 - Manual"
    },
    transaction_process: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1 - Bank transfer, 2 - Wallet"
    },
    cancel_approved_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "1 - Admin, 2 - Admin \/ Merchant"
    },
    return_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    return_type: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "1 - Reproduct, 2 - Wallet, 3 - Bank transfer"
    },
    coupon_limit: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_time_format: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    expire_date: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    create_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expiry_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    time_zone: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    domain_name: {
      type: DataTypes.STRING(70),
      allowNull: false
    },
    merchant_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    package_type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    profile_status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bill_payment_terms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    website_language_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    website_front_language_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ios_language_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ios_colorcode_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    android_language_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    android_colorcode_settings: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pos_ios_language_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    pos_ios_colorcode_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    pos_android_language_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    pos_android_colorcode_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    seller_ios_language_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    seller_ios_colorcode_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    seller_android_language_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    seller_android_colorcode_settings: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    online_store: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "1 - installed; 0 - not installed"
    },
    mobile_app: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "1 - installed; 0 - not installed"
    },
    pos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "1 - installed; 0 - not installed"
    },
    apps: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "1 - installed; 0 - not installed"
    },
    buy_button: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    facebook: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    android_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    android_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    ios_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    ios_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    pos_ios_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    pos_ios_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    pos_android_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    pos_android_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    seller_ios_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    seller_ios_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    seller_android_string_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    seller_android_colorcode_time: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    multiple_handler: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    express_delivery: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    express_delivery_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    express_delivery_terms: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    normal_delivery: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    normal_delivery_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    normal_delivery_terms: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    pickup_from_shop_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    delivery_hours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pickup_from_shop_terms: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    feature_product_limit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    home_category_list: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pagination_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    menu_listing_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency_digits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    currency_pading: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: "LEFT"
    },
    shop_days: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delivery_charge: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    mincart_amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      comment: "minimum card amount required for free shipping"
    },
    delivery_locations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "delivery locations displayed in checkout page"
    }
  }, {
    sequelize,
    tableName: 'settings',
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
