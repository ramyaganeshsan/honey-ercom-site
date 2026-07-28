import React from "react";
import { t } from "i18next";
import { Link } from "react-router-dom";
import { validateForm, extractErrors } from "../validation";
import { loginFormSchema } from "../validation/auth.validation";
import ErrorMessage from "../components/utils/error";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useGoogleSigninMutation,
  useFacebookSigninMutation,
  useTwitterSignInMutation,
} from "../rtk/networkcalls/auth.query";
import {
  encrypteString,
  getSessionID,
  handleResponse,
  removeSessionID,
  toastConfig,
  resolveAssetUrl,
  handleAssetImageError,
} from "../utils";
import { toast } from "react-toastify";
import { siteSettingsContext } from "../contexts";
import { useGoogleLogin } from "@react-oauth/google";

const SignInWithGuestOption = ({
  loginImage,
  updateUserCart,
  updatingCartDetails = false,
}) => {
  const [errors, setErrors] = React.useState({ email: "", password: "" });

  const [login, { isLoading: waitingForResponse }] = useLoginMutation();
  const [googleSignIn] = useGoogleSigninMutation();
  const [facebookSignIn] = useFacebookSigninMutation();
  const [twitterSignIn] = useTwitterSignInMutation();

  const settingsContext = React.useContext(siteSettingsContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target).entries());
    let validation = validateForm(loginFormSchema, data);

    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else {
      const response = await login(data);
      if (response.data) {
        if (Number(response.data?.status) === -3) {
          let errorObject = extractErrors(response?.data?.errors ?? []);
          setErrors(errorObject);
        } else if (Number(response.data?.status) === 1) {
          let userDetails = response?.data?.data?.userDetails;
          let message = response?.data?.message;
          userDetails = JSON.stringify(userDetails);
          e.target.reset();
          localStorage.setItem("user_details", encrypteString(userDetails));
          toast.success(message, toastConfig);
          let closeButton = document.getElementById(
            "signin_with_guest_close_button"
          );
          if (closeButton) {
            closeButton?.click();
          }
          settingsContext?.refetch();
          let sessionID = getSessionID();
          let location = window.location.pathname;
          removeSessionID();
          if (!sessionID || location !== "/cart") {
            navigate("/");
          }
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
      }
    }
  };

  const handleGoogleSuccess = async (response) => {
    const { access_token } = response;

    try {
      const googleResponse = await googleSignIn({
        access_token: access_token,
      });

      if (googleResponse.data) {
        if (Number(googleResponse.data?.status) === 1) {
          let userDetails = googleResponse.data?.data?.userDetails;
          let message = googleResponse.data?.message;
          userDetails = JSON.stringify(userDetails);
          localStorage.setItem("user_details", encrypteString(userDetails));
          toast.success(message, toastConfig);
          let closeButton = document.getElementById(
            "signin_with_guest_close_button"
          );
          if (closeButton) {
            closeButton?.click();
          }
          settingsContext?.refetch();
          let sessionID = getSessionID();
          let location = window.location.pathname;
          removeSessionID();
          if (!sessionID || location !== "/cart") {
            navigate("/");
          }
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  const handleGoogleFailure = (error) => {
    let message = t("something_went_wrong");
    toast.error(message, toastConfig);
    console.error(error);
  };
  const GoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    scope: "openid profile email",
  });
  const triggerGoogleSignIn = () => {
    GoogleLogin();
  };
  const handleFacebookLogin = () => {
    try {
      const clientId = process.env.REACT_APP_FACEBOOK_APP_ID;
      const redirectUri = process.env.REACT_APP_FACEBOOK_REDIRECTURL;
      const scope = "email,user_phone_number";
      const facebookOAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

      window.location.href = facebookOAuthUrl;
    } catch (error) {
      console.error("facebook sign-in failed", error);
    }
  };

  const handleTwitterLogin = async () => {
    try {
      const response = await twitterSignIn();
      window.location.href = response.data.data.redirectUrl;
    } catch (error) {
      console.error("Twitter sign-in failed", error);
    }
  };

  return (
    <div
      className="modal fade"
      id="signinModalWithGuest"
      tabIndex="-1"
      aria-labelledby="signinModalWithGuestLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body">
            <button
              type="button"
              id="signin_with_guest_close_button"
              className="btn-close"
              disabled={waitingForResponse || updatingCartDetails}
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
            <div className="login-wrapper">
              <div className="login-lft">
                <img
                  src={resolveAssetUrl(loginImage, "/images/no_image_available.png")}
                  alt={t("sign_in_image_alt_text")}
                  onError={(e) =>
                    handleAssetImageError(e, "/images/no_image_available.png")
                  }
                />
              </div>
              <div className="login-rgt">
                <h2 className="mb-2">{t("signin")}</h2>
                <small className="mb-3">{t("login_page_description")}</small>
                <form method="post" onSubmit={handleSubmit}>
                  <div className="mb-4 form-row">
                    <input
                      type="text"
                      name="email"
                      className="form-control"
                      placeholder={t("email")}
                    />
                    <ErrorMessage
                      message={errors?.email}
                      show={errors?.email && errors?.email !== ""}
                    />
                  </div>
                  <div className="mb-4 form-row">
                    <input
                      name="password"
                      type="password"
                      className="form-control"
                      placeholder={t("password")}
                    />
                    <ErrorMessage
                      message={errors?.password}
                      show={errors?.password && errors?.password !== ""}
                    />
                  </div>
                  <input
                    type="submit"
                    disabled={waitingForResponse || updatingCartDetails}
                    id="signin_submit_button"
                    className="mb-4 btn btn-primary theme_btn"
                    name="signin"
                    value={waitingForResponse ? t("please_wait") : t("signin")}
                  />

                  {!waitingForResponse && (
                    <>
                      <p className="login-opt-divider">Or</p>
                      <button
                        type="button"
                        disabled={updatingCartDetails}
                        onClick={() => updateUserCart(true, true)}
                        id="continue_as_guest_button"
                        className="mb-4 btn btn-primary theme_btn"
                      >
                        {t("continue_as_guest")}
                      </button>
                    </>
                  )}
                </form>
                <p className="login-opt-divider">Or</p>
                <ul className="login-opt-blk">
                  <li>
                    <Link
                      href="#"
                      className="login-fb"
                      title="Login with Facebook"
                      onClick={handleFacebookLogin}
                    ></Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="login-gmail"
                      title="Login with Gmail"
                      onClick={triggerGoogleSignIn}
                    ></Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="login-twitter"
                      title="Login with Twitter"
                      onClick={handleTwitterLogin}
                    ></Link>
                  </li>
                </ul>
                <p className="exist-acc">
                  {t("dont_have_account")}{" "}
                  <Link
                    href="#"
                    title={t("signup")}
                    data-bs-toggle="modal"
                    data-bs-target="#signupModal"
                  >
                    {t("signup")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInWithGuestOption;
