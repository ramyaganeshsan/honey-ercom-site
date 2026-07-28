import { t } from "i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrors, validateForm } from "../validation";
import { contactUsSchema } from "../validation/contactus.validation";
import { handleResponse, toastConfig } from "../utils";
import { toast } from "react-toastify";
import ErrorMessage from "../components/utils/error";
import { useAddContactInfoMutation } from "../rtk/networkcalls/contactus.query";

let initialErrorState = {
  name: "",
  email: "",
  message: "",
  phone_number: "",
};

const ContactUsForm = () => {
  const [errors, setErrors] = useState(initialErrorState);
  const navigate = useNavigate();
  const [addContactInfo, { isLoading: waitingForResponse }] =
    useAddContactInfoMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    let validation = validateForm(contactUsSchema, data);

    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else {
      let termsAndCondition = document.getElementById("terms_and_condition");
      if (!termsAndCondition || !termsAndCondition.checked) {
        let message = t("please_accept_terms_and_condition");
        toast.error(message, toastConfig);
      } else {
        const response = await addContactInfo(data);
        setErrors(initialErrorState);
        if (response.data) {
          if (Number(response.data?.status) === -3) {
            let errorObject = extractErrors(response?.data?.errors ?? []);
            setErrors(errorObject);
          } else if (Number(response.data?.status) === 1) {
            let message = response?.data?.message;
            toast.success(message, toastConfig);
            e.target.reset();
            navigate("/");
          } else {
            handleResponse(response?.data, toast, navigate);
          }
        } else {
          let message = t("something_went_wrong");
          toast.error(message, toastConfig);
          e.target.reset();
        }
      }
    }
  };

  return (
    <div className="col-sm-12 col-md-12 col-lg-6">
      <div className="contact-form-blk">
        <form method="POST" onSubmit={handleSubmit}>
          <div className="form-grp">
            <label htmlFor="name-input" className="form-label">
              {t("name")}
              <sup>*</sup>
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              id="name-input"
              placeholder={t("name")}
            />
            <ErrorMessage
              message={errors?.name}
              show={errors?.name && errors?.name !== ""}
            />
          </div>
          <div className="form-grp">
            <label htmlFor="phone-input" className="form-label">
              {t("phone_number")}
              <sup>*</sup>
            </label>
            <input
              type="text"
              name="phone_number"
              className="form-control"
              id="phone-input"
              placeholder={t("phone_number")}
            />
            <ErrorMessage
              message={errors?.phone_number}
              show={errors?.phone_number && errors?.phone_number !== ""}
            />
          </div>
          <div className="form-grp">
            <label htmlFor="email-input" className="form-label">
              {t("email")}
              <sup>*</sup>
            </label>
            <input
              type="text"
              name="email"
              className="form-control"
              id="email-input"
              placeholder={t("email")}
            />
            <ErrorMessage
              message={errors?.email}
              show={errors?.email && errors?.email !== ""}
            />
          </div>
          <div className="form-grp">
            <label htmlFor="message-input" className="form-label">
              {t("message")}
              <sup>*</sup>
            </label>
            <textarea
              className="form-control"
              id="message-input"
              name="message"
              rows="3"
              placeholder={t("message")}
            ></textarea>
            <ErrorMessage
              message={errors?.message}
              show={errors?.message && errors?.message !== ""}
            />
          </div>
          <div className="form-grp">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="terms_and_condition"
              />
              <label className="form-check-label" htmlFor="terms_and_condition">
                {t("accept_terms_and_condition")}
              </label>
            </div>
          </div>
          <div className="form-grp">
            <input
              className="btn theme_btn"
              type="submit"
              value={waitingForResponse ? t("please_wait") : t("submit")}
              disabled={waitingForResponse}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUsForm;
