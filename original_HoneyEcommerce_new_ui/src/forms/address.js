import { t } from "i18next";
import ErrorMessage from "../components/utils/error";

const AddressInfo = ({
  countries = [],
  handleCountryChange = null,
  handleStateChange = null,
  states = [],
  handleCityChanges = null,
  cities = [],
  errors = {},
  updatingProfile = false,
  handleFormSubmit = null,
  handleInputChange,
  currentState,
}) => {
  return (
    <>
      <div className="row">
        <div className="form-group mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label className="form_label" htmlFor="address">
            {t("address")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="address1"
            id="address"
            value={currentState?.address1}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("address")}
          />
          <ErrorMessage
            message={errors?.address1}
            show={errors?.address1 && errors?.address1 !== ""}
          />
        </div>
        <div className="form-group mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label htmlFor="country" className="form-label">
            {t("country")}
            <sup className="required_field">*</sup>
          </label>
          <select
            name="country_id"
            id="country"
            value={currentState?.country_id}
            onChange={(e) => handleCountryChange(e.target.value)}
            placeholder={t("country_placeholder")}
            className="form-control form-control-sm"
          >
            <option>{t("country_placeholder")}</option>
            {countries?.map((country) => {
              return (
                <option key={country?.country_id} value={country?.country_id}>
                  {country?.country_name}
                </option>
              );
            })}
          </select>
          <ErrorMessage
            message={errors?.country_id}
            show={errors?.country_id && errors?.country_id !== ""}
          />
        </div>
        <div className="form-group mb-3 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label htmlFor="state" className="form-label">
            {t("state")}
            <sup className="required_field">*</sup>
          </label>
          <select
            placeholder={t("state_placeholder")}
            className="form-control form-control-sm"
            name="state_id"
            value={currentState?.state_id}
            id="state"
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!currentState.country_id}
          >
            <option>{t("state_placeholder")}</option>
            {currentState.country_id &&
              states?.map((state) => {
                return (
                  <option key={state?.state_id} value={state?.state_id}>
                    {state?.state_name}
                  </option>
                );
              })}
          </select>
          <ErrorMessage
            message={errors?.state_id}
            show={errors?.state_id && errors?.state_id !== ""}
          />
        </div>
        <div className="form-group mb-4 col-sm-12 col-md-6 col-lg-6 col-xl-6">
          <label htmlFor="city" className="form-label">
            {t("city")}
            <sup className="required_field">*</sup>
          </label>
          <select
            placeholder={t("city_placeholder")}
            className="form-control form-control-sm"
            name="city_id"
            value={currentState?.city_id}
            id="city"
            onChange={(e) => handleCityChanges(e.target.value)}
            disabled={!currentState.state_id || !currentState.country_id}
          >
            <option>{t("city_placeholder")}</option>
            {currentState.state_id &&
              currentState.country_id &&
              cities?.map((city) => {
                return (
                  <option key={city?.city_id} value={city?.city_id}>
                    {city?.city_name}
                  </option>
                );
              })}
          </select>
          <ErrorMessage
            message={errors?.city_id}
            show={errors?.city_id && errors?.city_id !== ""}
          />
        </div>
        <div className="form-group col-sm-12 col-md-6 col-lg-3 col-xl-3">
          <input
            type="button"
            disabled={updatingProfile}
            className="btn theme_btn btn-md profile-save-button"
            name="save"
            onClick={handleFormSubmit}
            value={updatingProfile ? t("please_wait") : t("save")}
          />
        </div>
      </div>
    </>
  );
};

export default AddressInfo;
