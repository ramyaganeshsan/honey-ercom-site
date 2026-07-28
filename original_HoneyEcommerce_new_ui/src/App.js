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

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (getPageDirection() === "ltr") {
  import("./assets/css/ltr.css");
} else {
  import("./assets/css/rtl.css");
}

function App() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching } = useGetHomePageQuery();
  const [userCartDetails, setUserCartDetails] = React.useState({
    wishList: [],
  });

  React.useEffect(() => {
    if (!isLoading && data && +data?.status === 1) {
      document.title =
        data?.data?.siteSettings?.title ?? process.env.REACT_APP_SITE_NAME;
      setUserCartDetails((prev) => ({
        ...data?.data?.userCartDetails,
        wishList: [...prev?.wishList, ...data?.data?.userCartDetails?.wishList],
      }));
    } else {
      handleResponse(data, toast, navigate);
    }
    let html = document.getElementsByTagName("html");
    if (html && html.length > 0 && getPageDirection() === "rtl") {
      html[0]["dir"] = "rtl";
    }
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
