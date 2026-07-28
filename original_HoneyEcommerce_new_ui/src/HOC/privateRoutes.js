import React from "react";
import { getUserInfo } from "../utils";
import { Navigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { toastConfig } from "../utils";
import { toast } from "react-toastify";

const PrivateRoute = (props) => {
  const { t } = useTranslation();
  let userInfo = getUserInfo();
  if (userInfo?.user_id) {
    return props.children;
  }
  toast.error(t("login_to_access"), toastConfig);
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
