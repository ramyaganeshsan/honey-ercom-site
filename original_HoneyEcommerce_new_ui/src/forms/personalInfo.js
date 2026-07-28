import { t } from "i18next";
import ErrorMessage from "../components/utils/error";

const PersonalInfo = ({ errors = {}, handleInputChange, state = {} }) => {
  return (
    <>
      <div className="row">
        <div className="mb-4 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label className="form_label radio_label" htmlFor="gender">
            {t("gender")}
            <sup className="required_field">*</sup>
          </label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="gender"
              id="male"
              value={1}
              onChange={handleInputChange}
              checked={Number(state?.gender) === 1 ? true : false}
            />
            <label className="form-check-label" htmlFor="male">
              {t("male")}
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="gender"
              id="female"
              onChange={handleInputChange}
              value={0}
              checked={Number(state?.gender) === 0 ? true : false}
            />
            <label className="form-check-label" htmlFor="female">
              {t("female")}
            </label>
          </div>
          <ErrorMessage
            message={errors?.gender}
            show={errors?.gender && errors?.gender !== ""}
          />
        </div>
        <div className="mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label className="form_label" htmlFor="firstname">
            {t("first_name")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            value={state.firstname}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("first_name")}
          />
          <ErrorMessage
            message={errors?.firstname}
            show={errors?.firstname && errors?.firstname !== ""}
          />
        </div>
        <div className="mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label className="form_label" htmlFor="lastname">
            {t("last_name")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            value={state.lastname}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("last_name")}
          />
          <ErrorMessage
            message={errors?.lastname}
            show={errors?.lastname && errors?.lastname !== ""}
          />
        </div>
        <div className="mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label className="form_label" htmlFor="email">
            {t("email")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="email"
            onChange={handleInputChange}
            id="email"
            value={state.email}
            className="form-control form-control-sm"
            placeholder={t("email")}
          />
          <ErrorMessage
            message={errors?.email}
            show={errors?.email && errors?.email !== ""}
          />
        </div>
        <div className="mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label className="form_label" htmlFor="phone_number">
            {t("phone_number")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="phone_number"
            id="phone_number"
            value={state.phone_number}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("phone_number")}
          />
          <ErrorMessage
            message={errors?.phone_number}
            show={errors?.phone_number && errors?.phone_number !== ""}
          />
        </div>
      </div>
    </>
  );
};

export default PersonalInfo;
