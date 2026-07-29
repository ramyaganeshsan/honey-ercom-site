const express = require("express");
const authRouter = express.Router();

const { validateParams } = require("../middleware/auth.middleware");

const { signupSchema, loginSchema } = require("../validation/auth.validation");
const {
  signup,
  login,
  googleSignIn,
  facebookSignin,
  facebookCallback,
  twitterSignin,
  twitterCallback,
  sendOtp,
  verifyOtp,
} = require("../controller/auth.controller");

authRouter.post("/signup", validateParams(signupSchema), signup);
authRouter.post("/login", validateParams(loginSchema), login);
authRouter.post("/google_signin", googleSignIn);
authRouter.post("/facebook_signin", facebookSignin);
authRouter.get("/twitter_signin", twitterSignin);
authRouter.post("/twitter_callback", twitterCallback);
authRouter.post("/send_otp", sendOtp);
authRouter.post("/verify_otp", verifyOtp);

module.exports = authRouter;
