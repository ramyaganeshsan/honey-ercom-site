import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFacebookSigninMutation } from "../rtk/networkcalls/auth.query";
import { toast } from "react-toastify";
import {
  handleResponse,
  getSessionID,
  removeSessionID,
  toastConfig,
  persistUserDetails,
} from "../utils";
import SpinnerWithMessage from "./utils/spinnerWithMessage";

const FacebookRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [facebookCallback] = useFacebookSigninMutation();

  useEffect(() => {
    const fetchCode = async () => {
      const query = new URLSearchParams(location.search);
      const code = query.get("code");

      if (code) {
        try {
          const response = await facebookCallback({ code });
          if (response.data) {
            if (Number(response.data.status) === 1) {
              let userDetails = response.data?.data?.userDetails;
              let message = response.data?.message;
              persistUserDetails(userDetails);
              toast.success(message, toastConfig);

              let sessionID = getSessionID();
              let location = window.location.pathname;
              removeSessionID();
              if (!sessionID || location !== "/") {
                navigate("/");
              }
            } else {
              window.location.reload();

              handleResponse(response.data, toast, navigate);
            }
          } else {
            let message = "Something went wrong";
            toast.error(message, toastConfig);
            navigate("/");
          }
        } catch (error) {
          let message = "Something went wrong";
          toast.error(message, toastConfig);
          navigate("/");
        }
      } else {
        toast.error("No code found", toastConfig);
        navigate("/");
      }
    };

    fetchCode();
  }, [location, navigate, facebookCallback]);

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

export default FacebookRedirectHandler;
