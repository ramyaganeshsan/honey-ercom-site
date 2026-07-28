import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { siteSettingsContext } from "../../contexts";
import { toastConfig } from "../../utils";
import { t } from "i18next";
import { useAuthorisetamaraPaymentMutation } from "../../rtk/networkcalls/checkoutTest.query";
import SpinnerWithMessage from "../../components/utils/spinnerWithMessage";

const TamaraSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const payment_id = searchParams.get("orderId");
  const urlStatus = searchParams.get("orderId");
  const [AuthorisePaymentWithId] = useAuthorisetamaraPaymentMutation();
  const settingsContext = useContext(siteSettingsContext);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!payment_id) {
        toast.error("Payment ID is missing");
        navigate("/");
        return;
      }

      try {
        const response = await AuthorisePaymentWithId(payment_id);
        console.log("response.data.status : ", response.data.status);
        if (response.data.status === "approved") {
          let message = t("tabby_success_message");
          toast.success(message, toastConfig);
          // setTimeout(() => {
          //   window.location.reload();
          // }, 2000);
        } else if (
          response.data.status === "authorised" ||
          response.data.status === "fully_captured" ||
          response.data.status === "partially_captured"
        ) {
          let message = t("order_created_successfully");
          toast.success(message, toastConfig);
          settingsContext?.refetch();
          navigate("/");
        } else if (response.data.status === "new") {
          let message = t("tabby_payment_inprocess");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.data.status === "declined") {
          let message = t("tamara_failed_message");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.data.status === "expired") {
          let message = t("tabby_cancel_message");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else {
          let message = t("Failed_to_create_order");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        }
      } catch (error) {
        toast.error("Error verifying payment");
        console.error("Error verifying payment:", error);
      }
    };

    verifyPayment();
  }, [payment_id, navigate]);
  return (
    <>
      <div className="contact-page-ctnr">
        <div className="container">
          <div className="contact-page-ctnr-inner">
            <div className="twitter-authentication row">
              <SpinnerWithMessage
                height="calc(100dvh - 300px)"
                message={"Please wait, We are processing your request."}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TamaraSuccessPage;
