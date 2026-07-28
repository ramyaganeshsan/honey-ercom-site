import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { siteSettingsContext } from "../../contexts";
import { toastConfig } from "../../utils";
import { t } from "i18next";
import { useAuthorisetamaraPaymentMutation } from "../../rtk/networkcalls/checkoutTest.query";

const TamaraFailedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get("orderId");
  const [AuthorisePaymentWithId] = useAuthorisetamaraPaymentMutation();
  const settingsContext = useContext(siteSettingsContext);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        toast.error("Payment ID is missing");
        navigate("/");
        return;
      }

      try {
        const response = await AuthorisePaymentWithId(paymentId).unwrap();

        if (response.status === "approved") {
          let message = t("tabby_success_message");
          toast.success(message, toastConfig);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (
          response.status === "authorised" ||
          response.status === "fully_captured" ||
          response.status === "partially_captured"
        ) {
          let message = t("order_created_successfully");
          toast.success(message, toastConfig);
          settingsContext?.refetch();
          navigate("/");
        } else if (response.status === "new") {
          let message = t("tabby_cancel_message");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.status === "declined") {
          let message = t("tamara_failed_message");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.status === "expired") {
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
  }, [paymentId, navigate]);
};

export default TamaraFailedPage;
