import React, { useLayoutEffect, useState, useContext } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { Link } from "react-router-dom";

import {
  changeActiveLink,
  getLanguage,
  encrypteString,
  getSessionID,
  handleResponse,
  removeSessionID,
  toastConfig,
} from "../../utils";
import { t } from "i18next";
import { useGetAboutusCMSDetailsQuery } from "../../rtk/networkcalls/cms.query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Spinner from "../../components/utils/spinner";
import { loginFormSchema } from "../../validation/auth.validation";
import ErrorMessage from "../../components/utils/error";
import { validateForm, extractErrors } from "../../validation";
import { siteSettingsContext } from "../../contexts";
import {
  useLoginMutation,
  useGoogleSigninMutation,
  useFacebookSigninMutation,
  useTwitterSignInMutation,
} from "../../rtk/networkcalls/auth.query";
import { env } from "../../env";

const googleClinetId = env.GOOGLE_CLIENT_ID;
const googleRedirectURl = env.GOOGLE_REDIRECTURL;

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/about_us",
    text: t("about_us"),
    isActive: true,
  },
];

const SignInTest = ({ loginImage }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAboutusCMSDetailsQuery();
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [login, { isLoading: waitingForResponse }] = useLoginMutation();
  const [googleSignIn] = useGoogleSigninMutation();
  const [facebookSignIn] = useFacebookSigninMutation();
  const [twitterSignIn] = useTwitterSignInMutation();
  const settingsContext = useContext(siteSettingsContext);

  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

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
      const googleResponse = await googleSignIn({ access_token });
      if (googleResponse.data) {
        if (Number(googleResponse.data?.status) === 1) {
          let userDetails = googleResponse.data?.data?.userDetails;
          let message = googleResponse.data?.message;
          userDetails = JSON.stringify(userDetails);
          localStorage.setItem("user_details", encrypteString(userDetails));
          toast.success(message, toastConfig);
          settingsContext?.refetch();
          let sessionID = getSessionID();
          let location = window.location.pathname;
          removeSessionID();
          if (!sessionID || location !== "/cart") {
            navigate("/");
          }
        } else {
          handleResponse(googleResponse?.data, toast, navigate);
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
    googleClinetId,
    googleRedirectURl,
    scope: "openid profile email",
  });

  const triggerGoogleSignIn = () => {
    GoogleLogin();
  };

  const handleFacebookLogin = () => {
    try {
      const clientId = env.FACEBOOK_APP_ID;
      const redirectUri = env.FACEBOOK_REDIRECTURL;
      const scope = "email";
      const facebookOAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

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

  if (isLoading) {
    return <Spinner />;
  }

  if (
    (isError && !isLoading) ||
    (data?.data?.status && Number(data?.data?.status) !== 1)
  ) {
    navigate("/");
  }

  return (
    <>
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="contact-page-ctnr">
        <div className="container">
          <div className="contact-page-ctnr-inner">
            <div className="row">
              <div className="col-12">
                <h2 className="page-title">{t("about_us")}</h2>
              </div>
              <div
                className="about_us_page"
                dangerouslySetInnerHTML={{
                  __html:
                    getLanguage() === "en"
                      ? data?.data?.cms_desc
                      : data?.data?.cms_desc_french,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="signinModal"
        tabIndex="-1"
        aria-labelledby="signinModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <button
                type="button"
                id="signin_close_button"
                className="btn-close"
                disabled={waitingForResponse}
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
              <div className="login-wrapper">
                <div className="login-lft">
                  <img src={loginImage} alt={t("sign_in_image_alt_text")} />
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
                      disabled={waitingForResponse}
                      id="signin_submit_button"
                      className="mb-4 btn btn-primary theme_btn"
                      name="signin"
                      value={
                        waitingForResponse ? t("please_wait") : t("signin")
                      }
                    />
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
    </>
  );
};

export default SignInTest;
