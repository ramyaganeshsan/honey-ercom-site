import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoutes from "../HOC/privateRoutes";

import ErrorBoundary from "../components/utils/errorBoundry";

import Home from "../pages";

import Layout from "../components/layout";
import Spinner from "../components/utils/spinner";

/* Error's */
const Error404 = React.lazy(() => import("../pages/404"));
const MyOrders = React.lazy(() => import("../pages/user/myOrders"));

/* 
  We need to optiomize products page. it has lot of unnessessery updates 
  const OptmizedProducts = React.lazy(() =>
    import("../pages/common/optimizedProductsPage")
  );
*/
const Products = React.lazy(() => import("../pages/common/products"));

const ProductDetails = React.lazy(() =>
  import("../pages/common/productDetails")
);
const ContactUs = React.lazy(() => import("../pages/common/contactus"));
const AboutUs = React.lazy(() => import("../pages/common/aboutus"));
const TermsOfUse = React.lazy(() => import("../pages/common/termsAndUse"));
const PrivacyPolicy = React.lazy(() => import("../pages/common/privacyPolicy"));
const Faqs = React.lazy(() => import("../pages/common/faqs"));
const MyWishlist = React.lazy(() => import("../pages/user/wishlist"));
const SignInTest = React.lazy(() => import("../pages/common/signin"));
const OfferProducts = React.lazy(() => import("../pages/common/promotions"));
/*
  const ChangePassword = React.lazy(() => import("../pages/user/changePassword"));
*/

const MyProfile = React.lazy(() => import("../pages/user/profile"));
const Cart = React.lazy(() => import("../pages/user/cart"));
const Checkout = React.lazy(() => import("../pages/user/checkout"));
const CheckoutTest = React.lazy(() => import("../pages/user/checkoutTest"));

/* Payment page */
const PaymentSuccess = React.lazy(() => import("../pages/payment/success"));
const PaymentFailed = React.lazy(() => import("../pages/payment/failed"));

/* Tabby payment page */
const TabbySuccessPage = React.lazy(() =>
  import("../pages/payment/tabbySuccess")
);

const TabbyFailedPage = React.lazy(() =>
  import("../pages/payment/tabbyFailed")
);

const TabbycancelPage = React.lazy(() =>
  import("../pages/payment/tabbyCancel")
);

/* Tamara payment page */
const TamaraSuccessPage = React.lazy(() =>
  import("../pages/payment/tamaraSuccess")
);

const TamaraFailedPage = React.lazy(() =>
  import("../pages/payment/tamaraFailed")
);

const TamaracancelPage = React.lazy(() =>
  import("../pages/payment/tamaraCancel")
);

const TwitterSignInLoading = React.lazy(() =>
  import("../pages/common/twitterSignInLoading")
);
const FacebookRedirectHandler = React.lazy(() =>
  import("../components/facebookCallback")
);

let routes = [
  {
    path: "/",
    component: Home,
    protected: false,
    loadWithoutSuspense: true,
  },
  {
    path: "my_orders",
    component: MyOrders,
    protected: true,
  },
  {
    path: "api/auth/twitter_callback",
    component: TwitterSignInLoading,
    protected: false,
  },
  {
    path: "signin",
    component: SignInTest,
    protected: false,
  },
  {
    path: "facebook-signin",
    component: FacebookRedirectHandler,
    protected: false,
  },
  {
    path: "tabby-success",
    component: TabbySuccessPage,
    protected: false,
  },
  {
    path: "tabby-failed",
    component: TabbyFailedPage,
    protected: false,
  },
  {
    path: "tabby-cancel",
    component: TabbycancelPage,
    protected: false,
  },
  {
    path: "tamara-success",
    component: TamaraSuccessPage,
    protected: false,
  },
  {
    path: "tamara-fail",
    component: TamaraFailedPage,
    protected: false,
  },
  {
    path: "tamara-cancel",
    component: TamaracancelPage,
    protected: false,
  },
  /* 
  {
    path: "change_password",
    component: ChangePassword,
    protected: true,
  },
  */
  {
    path: "products",
    component: Products,
    protected: false,
  },
  {
    path: "promotions",
    component: OfferProducts,
    protected: false,
  },
  {
    path: "product_detail",
    component: ProductDetails,
    protected: false,
  },
  {
    path: "contact_us",
    component: ContactUs,
    protected: false,
  },
  {
    path: "about_us",
    component: AboutUs,
    protected: false,
  },
  {
    path: "terms_and_condition",
    component: TermsOfUse,
    protected: false,
  },
  {
    path: "privacy_policy",
    component: PrivacyPolicy,
    protected: false,
  },
  {
    path: "faqs",
    component: Faqs,
    protected: false,
  },
  {
    path: "wishlist",
    component: MyWishlist,
    // protected: true,
  },
  {
    path: "personal_info",
    component: MyProfile,
    protected: true,
  },
  {
    path: "cart",
    component: Cart,
    // protected: true,
  },
  {
    path: "checkout",
    component: Checkout,
    // protected: true,
  },
  {
    path: "CheckoutTest",
    component: CheckoutTest,
    // protected: true,
  },

  {
    path: "*",
    component: Error404,
    protected: false,
  },
];

const AppRoutes = () => {
  return (
    // <BrowserRouter>
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((route) => {
            if (route?.loadWithoutSuspense) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  exact
                  element={<route.component />}
                ></Route>
              );
            } else if (route?.protected) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoutes>
                      <React.Suspense fallback={<Spinner />}>
                        {<route.component />}
                      </React.Suspense>
                    </ProtectedRoutes>
                  }
                ></Route>
              );
            } else {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <React.Suspense fallback={<Spinner />}>
                      {<route.component />}
                    </React.Suspense>
                  }
                ></Route>
              );
            }
          })}
        </Route>
        <Route
          path={"success"}
          element={
            // <ProtectedRoutes>
            <React.Suspense fallback={<Spinner />}>
              {<PaymentSuccess />}
            </React.Suspense>
            // </ProtectedRoutes>
          }
        ></Route>
        <Route
          path={"failed"}
          element={
            // <ProtectedRoutes>
            <React.Suspense fallback={<Spinner />}>
              {<PaymentFailed />}
            </React.Suspense>
            // </ProtectedRoutes>
          }
        ></Route>
      </Routes>
    </ErrorBoundary>
    // </BrowserRouter>
  );
};

export default AppRoutes;
