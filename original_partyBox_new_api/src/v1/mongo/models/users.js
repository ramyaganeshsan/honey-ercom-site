const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const usersSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: false },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    firstname_french: { type: String, required: true },
    lastname_french: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    fb_user_id: { type: String, required: true },
    fb_session_key: { type: String, required: true },
    twitter_id: { type: String, required: true },
    twitter_access_token: { type: String, required: true },
    twitter_secret_token: { type: Number, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: true },
    dob: { type: String, required: true },
    city_id: { type: Number, required: true, default: 0 },
    state_id: { type: Number, required: true, default: 1 },
    country_id: { type: Number, required: true },
    phone_number: { type: String },
    my_favouites: { type: String, required: true },
    payment_account_id: { type: String, required: true },
    user_referral_balance: { type: Number, required: true },
    merchant_account_balance: { type: Number, required: true },
    merchant_commission: { type: Number, required: true },
    referral_id: { type: String, required: true },
    referred_user_id: { type: Number, required: true },
    deal_bought_count: { type: Number, required: true },
    created_by: { type: Number, required: true },
    user_type: { type: Number, required: true, default: 4 },
    user_status: { type: Number, required: true, default: 1 },
    login_type: { type: Number, required: true, default: 1 },
    joined_date: { type: Number, required: true },
    last_login: { type: Number, required: true },
    facebook_update: { type: Number, required: true, default: 0 },
    approve_status: { type: Number, required: true, default: 1 },
    wishlist: { type: String, required: true },
    ship_name: { type: String, required: true },
    ship_address1: { type: String, required: true },
    ship_address2: { type: String, required: true },
    ship_state: { type: String, required: true },
    ship_country: { type: Number, required: true },
    ship_city: { type: Number, required: true },
    ship_mobileno: { type: String, required: true },
    ship_zipcode: { type: Number, required: true },
    AccountCountryCode: { type: String, required: true },
    AccountEntity: { type: String, required: true },
    AccountNumber: { type: String, required: true },
    AccountPin: { type: String, required: true },
    UserName: { type: String, required: true },
    ShippingPassword: { type: String, required: true },
    flat_amount: { type: Number, required: true },
    change_password_must: { type: Number, required: true },
    gender: { type: Number, required: true },
    gplus_id: { type: String, required: true },
    gplus_access_token: { type: String, required: true },
    about_us: { type: String, required: true },
    fbid: { type: String, required: true },
    login_count: { type: Boolean, required: true },
    refference_key: { type: String, required: true },
    lang: { type: Number, required: true, default: 0 },
    is_guest: { type: Boolean, required: true },
    user_reg_type: { type: Number, required: true, default: 0 },
  },
  {
    collection: "users",
    timestamps: false,
  }
);

usersSchema.pre("save", async function (next) {
  if (this.user_id == null) {
    this.user_id = await getNextSequence("users");
  }
  next();
});

module.exports = mongoose.models.users || mongoose.model("users", usersSchema);
