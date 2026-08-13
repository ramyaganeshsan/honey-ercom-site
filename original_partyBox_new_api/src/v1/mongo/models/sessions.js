const mongoose = require("mongoose");

const sessionsSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true },
    cart: { type: String, default: "" },
    wishlist: { type: String, default: "" },
    isMovedToUsers: { type: Number, default: 0 },
    created_at: { type: Number },
  },
  {
    collection: "sessions",
    timestamps: false,
  }
);

module.exports = mongoose.models.sessions || mongoose.model("sessions", sessionsSchema);
