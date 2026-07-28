import React from "react";
import { t } from "i18next";
import { Link } from "react-router-dom";
import { validateForm, extractErrors } from "../validation";
import { signupFormSchema } from "../validation/auth.validation";
import ErrorMessage from "../components/utils/error";
import { useNavigate } from "react-router-dom";
import { useSignupMutation } from "../rtk/networkcalls/auth.query";
import {
  encrypteString,
  getSessionID,
  handleResponse,
  removeSessionID,
  toastConfig,
} from "../utils";
import { toast } from "react-toastify";
import { siteSettingsContext } from "../contexts";

const SignUp = ({ signupImage }) => {
  const [errors, setErrors] = React.useState({
    firstname: "",
    email: "",
    password: "",
    lastname: "",
    confirm_password: "",
    phone_number: "",
    terms_and_condition: "",
  });

  const [signup, { isLoading: waitingForResponse }] = useSignupMutation();

  const settingsContext = React.useContext(siteSettingsContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target).entries());
    delete data["termscheck"];
    let validation = validateForm(signupFormSchema, data);
    let termsAndCondition = document.getElementById("termscheck");

    if (!validation.isValidForm || !termsAndCondition.checked) {
      let errorObject = extractErrors(validation.errors ?? []);
      if (!termsAndCondition.checked) {
        errorObject["terms_and_condition"] = t("check_terms_and_condition");
      }
      setErrors(errorObject);
    } else if (data["confirm_password"] !== data["password"]) {
      setErrors((prev) => ({
        ...prev,
        confirm_password: t("password_mismatch"),
      }));
    } else {
      const response = await signup(data);
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
          let closeButton = document.getElementById("signup_close_button");
          if (closeButton) {
            closeButton?.click();
          }
          settingsContext?.refetch();
          let sessionID = getSessionID();
          let location = window.location.pathname;
          removeSessionID();

          if (!sessionID || location !== "/cart") {
            navigate("/personal_info");
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

  return (
    <div
      className="modal fade"
      id="signupModal"
      tabIndex="-1"
      aria-labelledby="signupModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body">
            <button
              type="button"
              className="btn-close"
              id="signup_close_button"
              data-bs-dismiss="modal"
              disabled={waitingForResponse}
              aria-label="Close"
            ></button>
            <div className="login-wrapper">
              <div className="login-lft">
                <img src={signupImage} alt={t("sign_up_image_alt_text")} />
              </div>
              <div className="login-rgt">
                <h2 className="mb-2">{t("signup")}</h2>
                <small className="mb-3">{t("signup_page_description")}</small>
                <form method="post" onSubmit={handleSubmit}>
                  <div className="mb-4 form-row">
                    <input
                      type="text"
                      name="firstname"
                      className="form-control"
                      placeholder={t("first_name")}
                    />
                    <ErrorMessage
                      message={errors?.firstname}
                      show={errors?.firstname && errors?.firstname !== ""}
                    />
                  </div>
                  <div className="mb-4 form-row">
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      placeholder={t("last_name")}
                    />
                    <ErrorMessage
                      message={errors?.lastname}
                      show={errors?.lastname && errors?.lastname !== ""}
                    />
                  </div>
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
                      type="text"
                      name="phone_number"
                      className="form-control"
                      placeholder={t("phone_number")}
                    />
                    <ErrorMessage
                      message={errors?.phone_number}
                      show={errors?.phone_number && errors?.phone_number !== ""}
                    />
                  </div>
                  <div className="mb-4 form-row">
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder={t("password")}
                    />
                    <ErrorMessage
                      message={errors?.password}
                      show={errors?.password && errors?.password !== ""}
                    />
                  </div>
                  <div className="mb-4 form-row">
                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      placeholder={t("confirm_password")}
                    />
                    <ErrorMessage
                      message={errors?.confirm_password}
                      show={
                        errors?.confirm_password &&
                        errors?.confirm_password !== ""
                      }
                    />
                  </div>
                  <div className="mb-4 form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value=""
                      name="termscheck"
                      id="termscheck"
                    />
                    <label className="form-check-label" htmlFor="termscheck">
                      {t("i_agree")}
                      <Link to="/privacy_policy">{t("terms_and_policy")}</Link>
                    </label>
                    <ErrorMessage
                      message={errors?.terms_and_condition}
                      show={
                        errors?.terms_and_condition &&
                        errors?.terms_and_condition !== ""
                      }
                    />
                  </div>
                  <input
                    type="submit"
                    disabled={waitingForResponse}
                    className="mb-4 btn btn-primary theme_btn"
                    name="signup"
                    value={
                      waitingForResponse
                        ? t("please_wait")
                        : t("create_account")
                    }
                  />
                </form>
                <p className="exist-acc">
                  {t("already_have_account")}{" "}
                  <Link
                    to="#"
                    title="Sign in"
                    data-bs-toggle="modal"
                    data-bs-target="#signinModal"
                  >
                    {t("signin")}
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

export default SignUp;
