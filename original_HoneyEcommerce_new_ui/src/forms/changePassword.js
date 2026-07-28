import { t } from "i18next";
import ErrorMessage from "../components/utils/error";

const ChangePassword = ({
  errors = {},
  handleInputChange = null,
  state = {},
  updatingPassword,
  handleFormSubmit,
}) => {
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="mb-3 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label className="form_label" htmlFor="old_password">
            {t("old_password")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="password"
            name="old_password"
            id="old_password"
            value={state.old_password}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("old_password")}
          />
          <ErrorMessage
            message={errors?.old_password}
            show={errors?.old_password && errors?.old_password !== ""}
          />
        </div>
      </div>
      <div className="row">
        <div className="mb-3 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label className="form_label" htmlFor="new_password">
            {t("new_password")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="password"
            name="new_password"
            id="new_password"
            value={state.new_password}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("new_password")}
          />
          <ErrorMessage
            message={errors?.new_password}
            show={errors?.new_password && errors?.new_password !== ""}
          />
        </div>
        <div className="mb-3 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label className="form_label" htmlFor="confirm_password">
            {t("confirm_password")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            value={state.confirm_password}
            onChange={handleInputChange}
            className="form-control form-control-sm"
            placeholder={t("confirm_password")}
          />
          <ErrorMessage
            message={errors?.confirm_password}
            show={errors?.confirm_password && errors?.confirm_password !== ""}
          />
        </div>
      </div>
      <div className="form-group col-sm-12 col-md-12 col-lg-12 col-xl-12">
        <input
          type="submit"
          disabled={updatingPassword}
          className="btn theme_btn btn-md profile-save-button"
          name="save"
          value={updatingPassword ? t("please_wait") : t("save")}
        />
      </div>
    </form>
  );
};

export default ChangePassword;
