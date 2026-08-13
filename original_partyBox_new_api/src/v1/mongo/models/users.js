const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const usersSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: false },
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    firstname_french: { type: String, default: "" },
    lastname_french: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    originalPassword: { type: String, default: "" },
    fb_user_id: { type: String, default: "" },
    fb_session_key: { type: String, default: "" },
    twitter_id: { type: String, default: "" },
    twitter_access_token: { type: String, default: "" },
    twitter_secret_token: { type: Number, default: 0 },
    address1: { type: String, default: "" },
    address2: { type: String, default: "" },
    dob: { type: String, default: "" },
    city_id: { type: Number, default: 0 },
    state_id: { type: Number, default: 1 },
    country_id: { type: Number, default: 0 },
    phone_number: { type: String },
    my_favouites: { type: String, default: "" },
    payment_account_id: { type: String, default: "" },
    user_referral_balance: { type: Number, default: 0 },
    merchant_account_balance: { type: Number, default: 0 },
    merchant_commission: { type: Number, default: 0 },
    referral_id: { type: String, default: "" },
    referred_user_id: { type: Number, default: 0 },
    deal_bought_count: { type: Number, default: 0 },
    created_by: { type: Number, default: 0 },
    user_type: { type: Number, default: 4 },
    user_status: { type: Number, default: 1 },
    login_type: { type: Number, default: 1 },
    joined_date: { type: Number, default: 0 },
    last_login: { type: Number, default: 0 },
    facebook_update: { type: Number, default: 0 },
    approve_status: { type: Number, default: 1 },
    wishlist: { type: String, default: "" },
    ship_name: { type: String, default: "" },
    ship_address1: { type: String, default: "" },
    ship_address2: { type: String, default: "" },
    ship_state: { type: String, default: "" },
    ship_country: { type: Number, default: 0 },
    ship_city: { type: Number, default: 0 },
    ship_mobileno: { type: String, default: "" },
    ship_zipcode: { type: Number, default: 0 },
    AccountCountryCode: { type: String, default: "" },
    AccountEntity: { type: String, default: "" },
    AccountNumber: { type: String, default: "" },
    AccountPin: { type: String, default: "" },
    UserName: { type: String, default: "" },
    ShippingPassword: { type: String, default: "" },
    flat_amount: { type: Number, default: 0 },
    change_password_must: { type: Number, default: 0 },
    gender: { type: Number, default: 0 },
    gplus_id: { type: String, default: "" },
    gplus_access_token: { type: String, default: "" },
    about_us: { type: String, default: "" },
    fbid: { type: String, default: "" },
    login_count: { type: Number, default: 0 },
    refference_key: { type: String, default: "" },
    lang: { type: Number, default: 0 },
    is_guest: { type: Number, default: 0 },
    isGuestUser: { type: Number, default: 0 },
    user_reg_type: { type: Number, default: 0 },
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
