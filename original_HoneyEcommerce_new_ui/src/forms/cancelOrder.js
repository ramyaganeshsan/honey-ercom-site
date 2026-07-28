import { t } from "i18next";
import ErrorMessage from "../components/utils/error";

const CancelOrder = ({
  errors = {},
  cancellingOrder,
  handleFormSubmit,
  orderId = "",
}) => {
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="row">
        <div className="mb-3 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <div className="alert alert-danger danger-alert" role="alert">
            {t("cancel_order_confirmation").replace("##ORDERID##", orderId)}
          </div>
        </div>
        <div className="mb-3 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <label className="form_label" htmlFor="cancellationReason">
            {t("cancel_reason")}
            <sup className="required_field">*</sup>
          </label>
          <input
            type="text"
            name="cancellationReason"
            id="cancellationReason"
            className="form-control form-control-sm"
            placeholder={t("cancel_reason")}
          />
          <ErrorMessage
            message={errors?.cancellationReason}
            show={
              errors?.cancellationReason && errors?.cancellationReason !== ""
            }
          />
        </div>
      </div>
      <div className="form-group col-sm-12 col-md-12 col-lg-12 col-xl-12">
        <input
          type="submit"
          disabled={cancellingOrder}
          className="btn theme_btn btn-md profile-save-button"
          name="save"
          value={cancellingOrder ? t("please_wait") : t("cancel")}
        />
      </div>
    </form>
  );
};

export default CancelOrder;
