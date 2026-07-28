var DataTypes = require("sequelize").DataTypes;
var _ads_mgmt = require("./ads_mgmt");
var _attribute = require("./attribute");
var _attribute_group = require("./attribute_group");
var _banner_image = require("./banner_image");
var _billing_info = require("./billing_info");
var _billing_reg_info = require("./billing_reg_info");
var _blog = require("./blog");
var _blog_comments = require("./blog_comments");
var _blog_settings = require("./blog_settings");
var _brand = require("./brand");
var _brand_module_settings = require("./brand_module_settings");
var _brand_product = require("./brand_product");
var _captcha_codes = require("./captcha_codes");
var _cart = require("./cart");
var _cart_items = require("./cart_items");
var _category = require("./category");
var _category_attribute = require("./category_attribute");
var _category_attribute_group = require("./category_attribute_group");
var _category_attribute_values = require("./category_attribute_values");
var _category_products = require("./category_products");
var _city = require("./city");
var _cms = require("./cms");
var _color_code = require("./color_code");
var _company_domain = require("./company_domain");
var _company_sms_settings = require("./company_sms_settings");
var _contact = require("./contact");
var _country = require("./country");
var _currency = require("./currency");
var _delivery_types = require("./delivery_types");
var _dummy_transaction = require("./dummy_transaction");
var _email_settings = require("./email_settings");
var _email_subscribe = require("./email_subscribe");
var _event = require("./event");
var _facebook_shop = require("./facebook_shop");
var _hesabe_payment_log = require("./hesabe_payment_log");
var _image_resize = require("./image_resize");
var _module_settings = require("./module_settings");
var _module_settings_data = require("./module_settings_data");
var _notification_template = require("./notification_template");
var _order_cancel = require("./order_cancel");
var _package_account_transaction = require("./package_account_transaction");
var _package_info = require("./package_info");
var _payment_gateway = require("./payment_gateway");
var _pos = require("./pos");
var _product = require("./product");
var _product_attribute = require("./product_attribute");
var _product_policy = require("./product_policy");
var _product_size = require("./product_size");
var _promocodes = require("./promocodes");
var _rate_review = require("./rate_review");
var _request_fund = require("./request_fund");
var _reviews = require("./reviews");
var _settings = require("./settings");
var _shipping_address = require("./shipping_address");
var _shipping_info = require("./shipping_info");
var _shipping_module_settings = require("./shipping_module_settings");
var _shops = require("./shops");
var _size = require("./size");
var _sms_otp = require("./sms_otp");
var _state = require("./state");
var _stores = require("./stores");
var _sub_products = require("./sub_products");
var _supplier = require("./supplier");
var _temp_transaction = require("./temp_transaction");
var _transaction = require("./transaction");
var _transaction_mapping = require("./transaction_mapping");
var _users = require("./users");
var _users_access_token = require("./users_access_token");
var _users_products_notification = require("./users_products_notification");
var _view_count_location = require("./view_count_location");
var _view_count_location_bkup = require("./view_count_location_bkup");
var _view_count_locationbkupdec10 = require("./view_count_locationbkupdec10");

function initModels(sequelize) {
  var ads_mgmt = _ads_mgmt(sequelize, DataTypes);
  var attribute = _attribute(sequelize, DataTypes);
  var attribute_group = _attribute_group(sequelize, DataTypes);
  var banner_image = _banner_image(sequelize, DataTypes);
  var billing_info = _billing_info(sequelize, DataTypes);
  var billing_reg_info = _billing_reg_info(sequelize, DataTypes);
  var blog = _blog(sequelize, DataTypes);
  var blog_comments = _blog_comments(sequelize, DataTypes);
  var blog_settings = _blog_settings(sequelize, DataTypes);
  var brand = _brand(sequelize, DataTypes);
  var brand_module_settings = _brand_module_settings(sequelize, DataTypes);
  var brand_product = _brand_product(sequelize, DataTypes);
  var captcha_codes = _captcha_codes(sequelize, DataTypes);
  var cart = _cart(sequelize, DataTypes);
  var cart_items = _cart_items(sequelize, DataTypes);
  var category = _category(sequelize, DataTypes);
  var category_attribute = _category_attribute(sequelize, DataTypes);
  var category_attribute_group = _category_attribute_group(sequelize, DataTypes);
  var category_attribute_values = _category_attribute_values(sequelize, DataTypes);
  var category_products = _category_products(sequelize, DataTypes);
  var city = _city(sequelize, DataTypes);
  var cms = _cms(sequelize, DataTypes);
  var color_code = _color_code(sequelize, DataTypes);
  var company_domain = _company_domain(sequelize, DataTypes);
  var company_sms_settings = _company_sms_settings(sequelize, DataTypes);
  var contact = _contact(sequelize, DataTypes);
  var country = _country(sequelize, DataTypes);
  var currency = _currency(sequelize, DataTypes);
  var delivery_types = _delivery_types(sequelize, DataTypes);
  var dummy_transaction = _dummy_transaction(sequelize, DataTypes);
  var email_settings = _email_settings(sequelize, DataTypes);
  var email_subscribe = _email_subscribe(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var facebook_shop = _facebook_shop(sequelize, DataTypes);
  var hesabe_payment_log = _hesabe_payment_log(sequelize, DataTypes);
  var image_resize = _image_resize(sequelize, DataTypes);
  var module_settings = _module_settings(sequelize, DataTypes);
  var module_settings_data = _module_settings_data(sequelize, DataTypes);
  var notification_template = _notification_template(sequelize, DataTypes);
  var order_cancel = _order_cancel(sequelize, DataTypes);
  var package_account_transaction = _package_account_transaction(sequelize, DataTypes);
  var package_info = _package_info(sequelize, DataTypes);
  var payment_gateway = _payment_gateway(sequelize, DataTypes);
  var pos = _pos(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var product_attribute = _product_attribute(sequelize, DataTypes);
  var product_policy = _product_policy(sequelize, DataTypes);
  var product_size = _product_size(sequelize, DataTypes);
  var promocodes = _promocodes(sequelize, DataTypes);
  var rate_review = _rate_review(sequelize, DataTypes);
  var request_fund = _request_fund(sequelize, DataTypes);
  var reviews = _reviews(sequelize, DataTypes);
  var settings = _settings(sequelize, DataTypes);
  var shipping_address = _shipping_address(sequelize, DataTypes);
  var shipping_info = _shipping_info(sequelize, DataTypes);
  var shipping_module_settings = _shipping_module_settings(sequelize, DataTypes);
  var shops = _shops(sequelize, DataTypes);
  var size = _size(sequelize, DataTypes);
  var sms_otp = _sms_otp(sequelize, DataTypes);
  var state = _state(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var sub_products = _sub_products(sequelize, DataTypes);
  var supplier = _supplier(sequelize, DataTypes);
  var temp_transaction = _temp_transaction(sequelize, DataTypes);
  var transaction = _transaction(sequelize, DataTypes);
  var transaction_mapping = _transaction_mapping(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var users_access_token = _users_access_token(sequelize, DataTypes);
  var users_products_notification = _users_products_notification(sequelize, DataTypes);
  var view_count_location = _view_count_location(sequelize, DataTypes);
  var view_count_location_bkup = _view_count_location_bkup(sequelize, DataTypes);
  var view_count_locationbkupdec10 = _view_count_locationbkupdec10(sequelize, DataTypes);

  cart_items.belongsTo(cart, { as: "cart", foreignKey: "cart_id"});
  cart.hasMany(cart_items, { as: "cart_items", foreignKey: "cart_id"});

  return {
    ads_mgmt,
    attribute,
    attribute_group,
    banner_image,
    billing_info,
    billing_reg_info,
    blog,
    blog_comments,
    blog_settings,
    brand,
    brand_module_settings,
    brand_product,
    captcha_codes,
    cart,
    cart_items,
    category,
    category_attribute,
    category_attribute_group,
    category_attribute_values,
    category_products,
    city,
    cms,
    color_code,
    company_domain,
    company_sms_settings,
    contact,
    country,
    currency,
    delivery_types,
    dummy_transaction,
    email_settings,
    email_subscribe,
    event,
    facebook_shop,
    hesabe_payment_log,
    image_resize,
    module_settings,
    module_settings_data,
    notification_template,
    order_cancel,
    package_account_transaction,
    package_info,
    payment_gateway,
    pos,
    product,
    product_attribute,
    product_policy,
    product_size,
    promocodes,
    rate_review,
    request_fund,
    reviews,
    settings,
    shipping_address,
    shipping_info,
    shipping_module_settings,
    shops,
    size,
    sms_otp,
    state,
    stores,
    sub_products,
    supplier,
    temp_transaction,
    transaction,
    transaction_mapping,
    users,
    users_access_token,
    users_products_notification,
    view_count_location,
    view_count_location_bkup,
    view_count_locationbkupdec10,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
