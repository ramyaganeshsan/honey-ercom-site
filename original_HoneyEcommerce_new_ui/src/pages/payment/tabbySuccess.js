import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useCapturePaymentMutation,
  useVerifyTabbyPaymentMutation,
} from "../../rtk/networkcalls/checkoutTest.query";
import { siteSettingsContext } from "../../contexts";
import { toastConfig } from "../../utils";
import { t } from "i18next";

const TabbySuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get("payment_id");
  const [verifyPaymentWithId] = useVerifyTabbyPaymentMutation();
  const settingsContext = useContext(siteSettingsContext);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        toast.error("Payment ID is missing");
        navigate("/");
        return;
      }

      try {
        const response = await verifyPaymentWithId(paymentId).unwrap();

        if (response.status === "AUTHORIZED") {
          let message = t("tabby_success_message");
          toast.success(message, toastConfig);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (response.status === "CLOSED") {
          let message = t("order_created_successfully");
          toast.success(message, toastConfig);
          settingsContext?.refetch();
          navigate("/");
        } else if (response.status === "CREATED") {
          let message = t("tabby_payment_inprocess");
          toast.success(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.status === "REJECTED") {
          let message = t("tabby_failed_message");
          toast.error(message, toastConfig);
          navigate("/checkoutTest");
        } else if (response.status === "EXPIRED") {
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

export default TabbySuccessPage;
