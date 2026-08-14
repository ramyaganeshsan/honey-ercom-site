import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { siteSettingsContext } from "../contexts";
import {
  AUTH_CHANGED_EVENT,
  getUserInfo,
} from "../utils";

/**
 * Live user session for UI chrome.
 * Login writes localStorage but older pages snapshotted getUserInfo() once,
 * which left the site stuck in guest mode until a full reload.
 */
export default function useUserInfo() {
  const [userInfo, setUserInfo] = useState(getUserInfo);
  const siteSettings = useContext(siteSettingsContext);
  const { pathname } = useLocation();

  const refresh = useCallback(() => {
    setUserInfo(getUserInfo());
  }, []);

  useEffect(() => {
    refresh();
  }, [
    pathname,
    siteSettings?.userCartDetails?.cartCount,
    siteSettings?.userCartDetails?.wishListCount,
    refresh,
  ]);

  useEffect(() => {
    const onAuth = () => refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [refresh]);

  return userInfo;
}
