import { useCallback, useContext } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { t } from "i18next";
import ProfileSidebarMenu from "../../components/menu/profileSidebarMenu";
import {
  useGetMyWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../rtk/networkcalls/wishlist.query";
import Spinner from "../../components/utils/spinner";
import { useNavigate } from "react-router-dom";
import {
  getUserInfo,
  handleResponse,
  removeSessionID,
  setSessionID,
  toastConfig,
  updateCartItemsBatch,
  updateWishlistItemsBatch,
} from "../../utils";
import { toast } from "react-toastify";
import { useEffect, useLayoutEffect, useState } from "react";
import EmptyWishlist from "../../components/utils/emptyWishlist";
import ProductWishListCard from "../../components/utils/productWishListCart";
import { siteSettingsContext, userCartDetailsContext } from "../../contexts";
import { useAddToMyCartMutation } from "../../rtk/networkcalls/cart.query";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import AccountBlocked from "../../components/utils/account_blocked";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/wishlist",
    text: t("wishlist"),
    isActive: true,
  },
];

const Wishlist = () => {
  const siteInfo = useContext(siteSettingsContext);
  const userCartDetails = useContext(userCartDetailsContext);
  const [userInfo] = useState(getUserInfo);
  const [addToMyCart, { isLoading: loadingAddToCart }] =
    useAddToMyCartMutation();
  const [removeFromWishlist, { isLoading: removingProductFromWishlist }] =
    useRemoveFromWishlistMutation();
  let [getMyWishlist, { isLoading, isError }] = useGetMyWishlistMutation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    updatingWishlist: false,
    wishlist: [],
    isEmptyWishlist: false,
  });
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  const fetchData = async () => {
    let response = await getMyWishlist();
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let wishlistDetails = response.data.data;
        let isEmptyWishlist = wishlistDetails && wishlistDetails?.length <= 0;
        setState((prev) => ({
          ...prev,
          wishlist: wishlistDetails,
          isEmptyWishlist,
        }));
      } else if (response.data?.status === -10) {
        setIsAccountBlocked(true);
      } else {
        handleResponse(response?.data, toast, navigate);
        navigate("/", { replace: true });
      }
    } else {
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = useCallback(async (id) => {
    // if (userInfo?.user_id) {
    let response = await addToMyCart({ dealId: id, quantity: 1, sizeId: "" });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        toast.success(message, toastConfig);

        let sessionID = response?.data?.sessionID ?? "";
        setSessionID(sessionID);

        let totalCartProducts = response?.data?.data?.totalCartProducts;
        updateCartItemsBatch(totalCartProducts);
        navigate("/cart");
      } else {
        handleResponse(response?.data, toast, navigate);
      }
    } else {
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
    }
    // } else {
    //   let message = t("please_login");
    //   toast.error(message, toastConfig);
    //   let signinButton = document.getElementById("signinButton");
    //   if (signinButton) {
    //     signinButton.click();
    //   }
    // }
  }, []);

  const removeProductFromWishlist = useCallback(async (id) => {
    // if (userInfo?.user_id) {
    let response = await removeFromWishlist({ productId: id });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        let totalWishlistCount = response?.data?.data?.totalWishListItems ?? 0;
        toast.success(message, toastConfig);
        updateWishlistItemsBatch(totalWishlistCount);
        userCartDetails?.removeProductFromUserWishlist(id);
        fetchData();
      } else {
        handleResponse(response?.data, toast, navigate, siteInfo?.refetch);
      }
    } else {
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
    }
    // } else {
    //   let message = t("please_login");
    //   toast.error(message, toastConfig);
    //   let signinButton = document.getElementById("signinButton");
    //   if (signinButton) {
    //     signinButton.click();
    //   }
    // }
  }, []);

  if (isError && !isLoading) {
    toast.error(t("something_went_wrong"), toastConfig);
    navigate("/");
  }

  if (!isLoading && state?.isEmptyWishlist) {
    return <EmptyWishlist />;
  }

  const handleLogout = () => {
    navigate("/");
    removeSessionID();
    localStorage.clear("user_details");
    window.location.reload();
  };
  if (isAccountBlocked) {
    return <AccountBlocked handleLogout={handleLogout} />;
  }

  return (
    <>
      {(loadingAddToCart || removingProductFromWishlist) && (
        <TransparentSpinner />
      )}
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="product-listpage-ctnr">
        <div className="container">
          <div className="row">
            <div className="product-listpage-ctnr-inner">
              <div className="product-list-lft">
                <ProfileSidebarMenu activeLink="wishlist" />
              </div>
              <div className="wishlist-rgt">
                {isLoading ? (
                  <Spinner height="calc(100vh - 200px)" />
                ) : state?.isEmptyWishlist ? (
                  <>
                    <h2 className="page-title">{t("wishlist")}</h2>
                    <EmptyWishlist />
                  </>
                ) : (
                  <>
                    <h2 className="page-title">{t("wishlist")}</h2>
                    {state?.wishlist.map((product) => {
                      return (
                        <ProductWishListCard
                          key={product.deal_id}
                          currencySymbol={
                            siteInfo?.siteSettings?.currency_symbol
                          }
                          product={product}
                          addToCart={addToCart}
                          loadingAddToCart={loadingAddToCart}
                          removingProductFromWishlist={
                            removingProductFromWishlist
                          }
                          removeFromWishlist={removeProductFromWishlist}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
