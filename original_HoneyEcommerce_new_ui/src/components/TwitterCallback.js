import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTwitterCallbackMutation } from "../rtk/networkcalls/auth.query";
import { toast } from "react-toastify";
import {
  handleResponse,
  getSessionID,
  removeSessionID,
  toastConfig,
  persistUserDetails,
} from "../utils";

const TwitterCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [twitterCallback] = useTwitterCallbackMutation();

  useEffect(() => {
    const fetchAccessToken = async () => {
      const query = new URLSearchParams(location.search);
      const oauth_token = query.get("oauth_token");
      const oauth_verifier = query.get("oauth_verifier");

      try {
        const response = await twitterCallback({ oauth_token, oauth_verifier });
        if (response.data) {
          if (Number(response.data.status) === 1) {
            let userDetails = response.data.data.userDetails;
            let message = response.data.message;
            persistUserDetails(userDetails);
            toast.success(message, toastConfig);
            let sessionID = getSessionID();
            let location = window.location.pathname;
            removeSessionID();
            if (!sessionID || location !== "/") {
              navigate("/");
            }
            window.location.reload();
          } else {
            handleResponse(response.data, toast, navigate);
          }
        } else {
          let message = "Something went wrong";
          toast.error(message, toastConfig);
        }
      } catch (error) {
        let message = "Something went wrong";
        toast.error(message, toastConfig);
      }
    };

    fetchAccessToken();
  }, [location, navigate, twitterCallback]);

  return <div>Loading...</div>;
};

export default TwitterCallback;
