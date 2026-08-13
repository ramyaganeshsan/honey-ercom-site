const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const company_domainSchema = new mongoose.Schema(
  {
    domain_id: { type: Number, required: false },
    opportunity_id: { type: Number, required: true },
    create_user: { type: Number, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    org_password: { type: String, required: true },
    company_name: { type: String, required: true },
    company_domain: { type: String, required: true },
    company_email: { type: String, required: true },
    mobile: { type: String, required: true },
    oppo_product: { type: Number, required: true },
    free_trial: { type: Number, required: true },
    project_version: { type: String, required: true },
    time_zone: { type: String, required: true },
    country: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    telephone_code: { type: String, required: true },
    driverpassword: { type: String, required: true },
    message: { type: String, required: true },
    create_date: { type: Number, required: true },
    expiry_date: { type: Number, required: true },
    domain_status: { type: Number, required: true, default: 1 },
    mobileauthcode: { type: String, required: true },
    modified_date: { type: Number, required: true },
    modified_user_id: { type: Number, required: true },
    DatabaseUsername: { type: String, required: true },
    DatabasePassword: { type: String, required: true },
    response: { type: String, required: true },
    type_completed: { type: Number, required: true, default: 0 },
    instanceID: { type: String, required: true },
    DBtype: { type: Number, required: true, default: 1 },
    PublicIP: { type: String, required: true },
    Status: { type: String, required: true },
  },
  {
    collection: "company_domain",
    timestamps: false,
  }
);

company_domainSchema.pre("save", async function (next) {
  if (this.domain_id == null) {
    this.domain_id = await getNextSequence("company_domain");
  }
  next();
});

module.exports = mongoose.models.company_domain || mongoose.model("company_domain", company_domainSchema);
