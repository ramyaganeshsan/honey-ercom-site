import React, { useState, useEffect, useContext } from "react";
import SpinnerWithMessage from "../../components/utils/spinnerWithMessage";
import { useCheckPaymentStatusMutation } from "../../rtk/networkcalls/checkout.query";
import { t } from "i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { handleResponse, toastConfig } from "../../utils";
import { siteSettingsContext } from "../../contexts";

const PaymentSuccess = () => {
  let [searchParams] = useSearchParams();
  let navigate = useNavigate();

  let [state, setState] = useState({ message: "" });
  const settingsContext = useContext(siteSettingsContext);

  let [checkPaymentStatus, { isLoading, isError }] =
    useCheckPaymentStatusMutation();

  useEffect(() => {
    const validatePaymentStatus = async () => {
      let response = await checkPaymentStatus({
        paymentId: searchParams.get("paymentId"),
        id: searchParams.get("Id"),
        type: 1,
      });
      if (response.data) {
        if (Number(response.data?.status) === 1) {
          let message = response?.data?.message;
          toast.success(message, toastConfig);
          settingsContext?.refetch();
          navigate("/");
        } else if (Number(response?.data?.status) === 0) {
          setState({
            message: response?.data?.message ?? t("refresh_the_page"),
          });
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
      }
    };

    if (!searchParams.get("paymentId") || !searchParams.get("Id")) {
      navigate("/", { replace: true });
    } else {
      validatePaymentStatus();
    }
  }, []);

  if (isLoading) {
    return <SpinnerWithMessage height="100vh" message={t("do_not_refresh")} />;
  }

  if (isError) {
    return (
      <div className="payment_success_page">
        <p>{t("refresh_the_page")}</p>
        <span>
          {t("any_issues_contact_us")}
          <Link to="/contact_us" replace={true}>
            {t("contact_us")}
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="payment_success_page">
      <p>{state?.message ? state?.message : t("refresh_the_page")}</p>
      <span>
        {t("any_issues_contact_us")}
        <Link to="/contact_us" replace={true}>
          {t("contact_us")}
        </Link>
      </span>
    </div>
  );
};

export default PaymentSuccess;
