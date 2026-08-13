/*global FB*/

import React from "react";
import Routescomponent from "./routes";
import "./lang/i18n";
import { useGetHomePageQuery } from "./rtk/networkcalls/homePage.query";
import Spinner from "./components/utils/spinner";
import { siteSettingsContext, userCartDetailsContext } from "./contexts";
import SomethingWentWrong from "./components/utils/somethingWentWrong";
import { getPageDirection, handleResponse } from "./utils";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import TwitterCallback from "./components/TwitterCallback";
import { toast } from "react-toastify";
import { env } from "./env";

// GoogleOAuthProvider throws if clientId is empty — use a placeholder when unset
const clientId =
  env.GOOGLE_CLIENT_ID && String(env.GOOGLE_CLIENT_ID).trim() !== ""
    ? env.GOOGLE_CLIENT_ID
    : "google-oauth-not-configured.apps.googleusercontent.com";

function ensureStylesheet(id, href) {
  let link = document.getElementById(id);
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href);
  }
}

function applyThemeDirection() {
  const dir = getPageDirection() === "rtl" ? "rtl" : "ltr";
  ensureStylesheet("theme-style", "/css/style.css");
  ensureStylesheet("theme-media-style", "/css/media_style.css");
  ensureStylesheet(
    "theme-bootstrap",
    dir === "rtl" ? "/css/bootstrap.rtl.min.css" : "/css/bootstrap.min.css"
  );
  const html = document.getElementsByTagName("html")[0];
  if (html) html.dir = dir;
}

// Load theme CSS as plain public links (not Vite CSS imports) so
// /images and /fonts URLs are not rewritten to /public/...
applyThemeDirection();

function App() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching } = useGetHomePageQuery();
  const [userCartDetails, setUserCartDetails] = React.useState({
    wishList: [],
  });

  React.useEffect(() => {
    applyThemeDirection();
  }, []);

  React.useEffect(() => {
    if (!isLoading && data && +data?.status === 1) {
      document.title =
        data?.data?.siteSettings?.title ?? env.SITE_NAME;
      setUserCartDetails((prev) => ({
        ...data?.data?.userCartDetails,
        wishList: [...prev?.wishList, ...data?.data?.userCartDetails?.wishList],
      }));
    } else {
      handleResponse(data, toast, navigate);
    }
    applyThemeDirection();
  }, [data, isLoading]);

  const removeProductFromUserWishlist = React.useCallback(
    (id) => {
      if (userCartDetails?.wishList) {
        let wishList = [...userCartDetails?.wishList] ?? [];
        if (wishList.indexOf(id) > -1) {
          wishList.splice(wishList.indexOf(id), 1);
          setUserCartDetails((prev) => ({ ...prev, wishList }));
        }
      }
    },
    [userCartDetails]
  );

  const addProductToUserWishList = React.useCallback(
    (id) => {
      if (userCartDetails?.wishList) {
        let wishList = [...userCartDetails?.wishList] ?? [];
        if (!wishList?.includes(id)) {
          wishList.push(id);
          setUserCartDetails((prev) => ({ ...prev, wishList }));
        }
      }
    },
    [userCartDetails]
  );

  if (isLoading || isFetching) {
    return <Spinner height="100vh" />;
  }

  if (!isLoading && (Number(data?.status) !== 1 || !data?.status)) {
    return <SomethingWentWrong />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <siteSettingsContext.Provider
        value={{ ...data?.data, refetch: refetch } ?? {}}
      >
        <userCartDetailsContext.Provider
          value={{
            wishList: userCartDetails?.wishList,
            removeProductFromUserWishlist,
            addProductToUserWishList,
          }}
        >
          {/* <Router> */}
          <Routes>
            <Route exact path="/" component={Routes} />
            <Route
              path="/api/auth/twitter_callback"
              element={<TwitterCallback />}
            />
          </Routes>
          {/* </Router> */}
          <Routescomponent />
        </userCartDetailsContext.Provider>
      </siteSettingsContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default React.memo(App);
