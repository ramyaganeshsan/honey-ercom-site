import { Link, useSearchParams, useNavigate } from "react-router-dom";
import SomethingWentWrong from "../../components/utils/somethingWentWrong";
import { useGetProductDetailsQuery } from "../../rtk/networkcalls/product.query";
import { useGetReviewsMutation } from "../../rtk/networkcalls/review.query";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../rtk/networkcalls/wishlist.query";
import { useAddToMyCartMutation } from "../../rtk/networkcalls/cart.query";
import {
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  changeActiveLink,
  encrypteQueryData,
  getUserInfo,
  productFilters,
  toastConfig,
  convertTimestampToDate,
  handleResponse,
  updateCartItemsBatch,
  getWordBasedOnLanguage,
  checkProductIsAlreadyWishlisted,
  updateWishlistItemsBatch,
  // getSessionID,
  setSessionID,
  removeSessionID,
} from "../../utils";
import { t } from "i18next";
import BreadCrumb from "../../components/utils/breadcrumb";
import Spinner from "../../components/utils/spinner";
import { toast } from "react-toastify";
import { siteSettingsContext, userCartDetailsContext } from "../../contexts";
import ProductCard from "../../components/utils/productCard";
import ProductCarouselContainer from "../../components/utils/productCarouselContainer";
import Corousel from "../../components/utils/carousel";
import ReviewForm from "../../forms/review";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import Price from "../../components/utils/price";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
  XIcon,
} from "react-share";
import { env } from "../../env";

const getStars = (totalStars) => {
  let stars = [];
  let i = 0;
  for (i; i < totalStars; i++) {
    stars.push(<i key={i} className="star_icon active"></i>);
  }
  if (i < 5) {
    for (let j = i; j < 5; j++) {
      stars.push(<i key={j} className="star_icon"></i>);
    }
  }
  return stars;
};

const getReviewStars = (totalStars) => {
  let stars = [];
  let i = 0;
  for (i; i < totalStars; i++) {
    stars.push(<span key={i} className="review-star active"></span>);
  }
  if (i < 5) {
    for (let j = i; j < 5; j++) {
      stars.push(<span key={j} className="review-star"></span>);
    }
  }
  return stars;
};

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: `/products?q=${encrypteQueryData(
      JSON.stringify({ ...productFilters })
    )}`,
    text: t("products"),
  },
  {
    id: 2,
    path: "/",
    text: t("products_detail"),
    isActive: true,
  },
];

const ProductDetails = () => {
  const [addToWishlist, { isLoading: loadingAddToWishlist }] =
    useAddToWishlistMutation();
  const [addToMyCart, { isLoading: loadingAddToCart }] =
    useAddToMyCartMutation();
  const [removeFromWishlist, { isLoading: removingProductFromWishlist }] =
    useRemoveFromWishlistMutation();
  const [userInfo] = useState(getUserInfo);
  const siteInfo = useContext(siteSettingsContext);
  const userCartDetails = useContext(userCartDetailsContext);
  const [searchParams] = useSearchParams();
  const prevQuery = useRef(null);
  const removingNode = useRef(false);

  const numberOfProductImages = useRef([1, 2, 3, 4]);
  const navigate = useNavigate();

  const [state, setState] = useState({
    subProduct: null,
    subProductPrice: 0,
    subProductDiscount: 0,
    subProductQuantity: 0,
    subProductCode: "",
    totalQuantity: 1,
    currentImage: null,
    imageName: `${searchParams.get("q")}_1.png`,
  });

  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);
  }, []);

  const { data, isLoading, isFetching, isError, isUninitialized } =
    useGetProductDetailsQuery(searchParams.get("q") ?? "");
  const [getReviews, { data: reviews, isLoading: fetchingReviews }] =
    useGetReviewsMutation();

  useEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (prevQuery.current !== searchParams.get("q")) {
      prevQuery.current = searchParams.get("q");
      if (window) {
        window?.scrollTo(-200, -200);
      }
      setState(() => ({
        subProduct: null,
        subProductPrice: 0,
        subProductDiscount: 0,
        subProductQuantity: 0,
        totalQuantity: 1,
        currentImage: null,
        imageName: `${searchParams.get("q")}_1.png`,
      }));
    }
  }, [searchParams.get("q")]);

  useEffect(() => {
    if (Number(data?.status) === 0) {
      let message = data?.message ?? t("product_details_not_found");
      toast.error(message, toastConfig);
      navigate("/");
    } else if (Number(data?.status) === 1) {
      if (
        data?.data?.having_size_color &&
        data?.data?.sizeAndQuantity &&
        data?.data?.sizeAndQuantity.length > 0
      ) {
        setState((prev) => ({
          ...prev,
          subProduct: data?.data?.sizeAndQuantity[0]["size_id"] ?? null,
          subProductPrice: data?.data?.sizeAndQuantity[0]["price"] ?? 0,
          subProductDiscount: data?.data?.sizeAndQuantity[0]["discount"] ?? 0,
          subProductQuantity: data?.data?.sizeAndQuantity[0]["quantity"],
          subProductCode: data?.data?.sizeAndQuantity[0]["sku"],
        }));
      }
    }
  }, [data]);

  if (isLoading || isFetching) {
    return <Spinner />;
  }

  if (
    !searchParams.get("q") ||
    !searchParams.get("q") ||
    (isError && !isLoading && !isUninitialized) ||
    data?.status === -2 ||
    data?.status === -4 ||
    data?.status === -3
  ) {
    return <SomethingWentWrong />;
  }

  const handleSubProductChange = (subProduct) => {
    setState((prev) => ({
      ...prev,
      subProduct: subProduct["size_id"] ?? null,
      subProductPrice: subProduct["price"] ?? 0,
      subProductDiscount: subProduct["discount"] ?? 0,
      subProductQuantity: subProduct["quantity"],
      subProductCode: subProduct["sku"],
    }));
  };

  const addToCart = async (id) => {
    // if (userInfo?.user_id) {
    if (
      (!state.subProduct || isNaN(state.subProduct)) &&
      data?.data?.having_size_color
    ) {
      let message = t("select_the_quantity");
      toast.error(message, toastConfig);
      return;
    }

    let cartDetails = {
      dealId: Number(id),
      quantity:
        state?.totalQuantity && state?.totalQuantity > 0
          ? state?.totalQuantity
          : 1,
      sizeId: data?.data?.having_size_color ? Number(state.subProduct) : "",
    };

    let response = await addToMyCart(cartDetails);
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
  };
  const addToCartJust = async (id) => {
    // if (userInfo?.user_id) {
    if (
      (!state.subProduct || isNaN(state.subProduct)) &&
      data?.data?.having_size_color
    ) {
      let message = t("select_the_quantity");
      toast.error(message, toastConfig);
      return;
    }

    let cartDetails = {
      dealId: Number(id),
      quantity:
        state?.totalQuantity && state?.totalQuantity > 0
          ? state?.totalQuantity
          : 1,
      sizeId: data?.data?.having_size_color ? Number(state.subProduct) : "",
    };

    let response = await addToMyCart(cartDetails);
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        toast.success(message, toastConfig);

        let sessionID = response?.data?.sessionID ?? "";
        setSessionID(sessionID);

        let totalCartProducts = response?.data?.data?.totalCartProducts;
        updateCartItemsBatch(totalCartProducts);
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
  };

  const addToMyWishlist = async (e, id) => {
    // if (userInfo?.user_id) {
    let response = await addToWishlist({ productId: id });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        toast.success(message, toastConfig);

        let sessionID = response?.data?.sessionID ?? "";
        setSessionID(sessionID);

        let wishlistCountElement = document.getElementById("wishlistCount");
        if (wishlistCountElement) {
          let totalWishlistCount =
            response?.data?.data?.totalWishlistedProducts;
          if (totalWishlistCount && !isNaN(totalWishlistCount)) {
            wishlistCountElement.innerHTML = totalWishlistCount;
          } else {
            wishlistCountElement.innerHTML = 0;
          }
        }
        e?.target?.classList?.add("btn-wishlisted");
        userCartDetails?.addProductToUserWishList(id);
        // navigate("/wishlist");
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
  };

  const handleImageLoadFailed = (event) => {
    if (event && event?.currentTarget) {
      /*
        Replace with no image available.
        event.currentTarget.onerror = null;
        event.currentTarget.src = `${data?.data?.no_image_url}`;
      */

      try {
        removingNode.current = true;
        let parent = event.currentTarget.parentElement;
        let grandParent = parent.parentElement;

        // if (parent) parent?.remove();
        if (grandParent) grandParent.style.border = "none";
        if (grandParent) grandParent.style.display = "none";
        // if (event?.currentTarget) event?.currentTarget?.remove();
        removingNode.current = false;
      } catch (err) {
        removingNode.current = false;
        console.log(err);
      }
    }
  };

  const handleImageLoadFailedMainImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = `${data?.data?.no_image_url}`;
  };

  const handleImageChange = (imageName) => {
    setState((prev) => ({
      ...prev,
      imageName,
    }));
  };

  const handleProductQuantityChange = (type) => {
    if (type === "add") {
      if (state.totalQuantity < 25) {
        setState((prev) => {
          return {
            ...prev,
            totalQuantity: prev.totalQuantity + 1,
          };
        });
      }
    } else {
      if (state.totalQuantity > 1) {
        setState((prev) => ({
          ...prev,
          totalQuantity: prev.totalQuantity - 1,
        }));
      }
    }
  };

  const handleReviewTabChange = async () => {
    if (data?.data?.total_reviews > 0) {
      await getReviews(data?.data?.deal_id);
    }
  };

  const removeProductFromWishlist = async (e, id) => {
    // if (userInfo?.user_id) {
    let response = await removeFromWishlist({ productId: id });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        let totalWishlistCount = response?.data?.data?.totalWishListItems ?? 0;
        toast.success(message, toastConfig);
        updateWishlistItemsBatch(totalWishlistCount);
        e?.target?.classList?.remove("btn-wishlisted");
        userCartDetails?.removeProductFromUserWishlist(id);
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
  };

  const shareUrl = `${
    env.FRONT_END_BASE_URL
  }/product_detail?q=${searchParams.get("q")}`;
  const title = getWordBasedOnLanguage(
    siteInfo?.siteSettings?.site_name,
    siteInfo?.siteSettings?.site_name_french
  );

  return (
    <>
      {(loadingAddToWishlist ||
        loadingAddToCart ||
        removingProductFromWishlist) &&
        !isLoading && <TransparentSpinner />}
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <section className="product_details_container">
        <div className="container">
          <div className="row">
            <div className="product_details_inner">
              <div className="product_details_left">
                <div className="prod_zoom_container">
                  <div className="prod_zoom_container_inner">
                    <div className="easyzoom easyzoom--overlay easyzoom--with-thumbnails">
                      <span>
                        <img
                          onError={handleImageLoadFailedMainImage}
                          src={`${data?.data?.image_url}${state.imageName}`}
                          // alt={data?.data?.deal_title}
                          alt={getWordBasedOnLanguage(
                            data?.data?.deal_title,
                            data?.data?.deal_title_french
                          )}
                        />
                      </span>
                    </div>
                  </div>
                </div>
                <ul className="thumbnails">
                  {!removingNode.current &&
                    numberOfProductImages.current.map((imageId) => {
                      let imageName = `${searchParams.get("q")}_${imageId}.png`;
                      if (state.imageName !== imageName) {
                        return (
                          <li key={imageName}>
                            <span onClick={() => handleImageChange(imageName)}>
                              <img
                                onError={handleImageLoadFailed}
                                src={`${data?.data?.image_url}${imageName}`}
                                // alt={data?.data?.deal_title}
                                alt={getWordBasedOnLanguage(
                                  data?.data?.deal_title,
                                  data?.data?.deal_title_french
                                )}
                              />
                            </span>
                          </li>
                        );
                      }
                      return null;
                    })}
                </ul>
              </div>
              <div className="product_details_right">
                <div className="product_details_right_inner">
                  <h2 className="prod_details_title">
                    {/* {data?.data?.deal_title} */}
                    {getWordBasedOnLanguage(
                      data?.data?.deal_title,
                      data?.data?.deal_title_french
                    )}
                  </h2>
                  <p className="prod-sm-det">
                    {data?.data?.type && (
                      <span>
                        {t("type")}: {data?.data?.type}
                      </span>
                    )}
                    {data?.data?.incredient && (
                      <span>
                        {t("incredient")}: {data?.data?.incredient}
                      </span>
                    )}
                  </p>
                  <div className="prod-count-ctnr">
                    <span className="star">
                      {getStars(data?.data?.ratings ?? 0)}
                    </span>
                    <span className="review_count">
                      {data?.data?.total_reviews} {t("reviews")}
                    </span>
                    <span
                      className={`stock-detail 
                      ${
                        data?.data?.having_size_color
                          ? state?.subProductQuantity > 0
                            ? "in-stock"
                            : "out-of-stock"
                          : data?.data?.inStock
                          ? "in-stock"
                          : "out-of-stock"
                      }
                      `}
                    >
                      {data?.data?.having_size_color
                        ? state?.subProductQuantity > 0
                          ? t("in_stock")
                          : t("out_of_stock")
                        : data?.data?.inStock
                        ? t("in_stock")
                        : t("out_of_stock")}
                    </span>
                  </div>
                  {/* <div className="price_block">
                    <span className="price">
                      {siteInfo?.siteSettings?.currency_symbol}{" "}
                      {data?.data?.having_size_color
                        ? state?.subProductDiscount ?? 0
                        : data?.data?.deal_value}
                    </span>
                    <strike>
                      {siteInfo?.siteSettings?.currency_symbol}{" "}
                      {data?.data?.having_size_color
                        ? state?.subProductPrice ?? 0
                        : data?.data?.deal_price}
                    </strike>
                  </div> */}

                  <Price
                    fromProductDetatails
                    currentSymbol={siteInfo?.siteSettings?.currency_symbol}
                    originalPrice={
                      data?.data?.having_size_color
                        ? state?.subProductPrice ?? 0
                        : data?.data?.deal_price
                    }
                    discountPrice={
                      data?.data?.having_size_color
                        ? state?.subProductDiscount ?? 0
                        : data?.data?.deal_value
                    }
                  />

                  {data?.data?.sizeAndQuantity &&
                    data?.data?.sizeAndQuantity?.length > 0 && (
                      <div className="prod-wght-blk">
                        <span>{t("weight")}:</span>
                        {data?.data?.sizeAndQuantity?.map((quantity) => {
                          return (
                            <button
                              key={quantity?.size_id}
                              onClick={() => handleSubProductChange(quantity)}
                              className={`btn ${
                                state.subProduct === quantity.size_id
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {quantity.size_name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  <div className="prod-operations">
                    {((data?.data?.having_size_color &&
                      state?.subProductQuantity > 0) ||
                      (!data?.data?.having_size_color &&
                        data?.data?.inStock > 0)) && (
                      <div className="prod-optop">
                        <div className="qty_value">
                          <button
                            onClick={() => handleProductQuantityChange()}
                            className="qtyup fa fa-minus"
                            title={t("reduce")}
                          ></button>
                          <span>
                            <input
                              name="qty"
                              id="qtydata1"
                              value={state.totalQuantity}
                              disabled
                              readOnly="readonly"
                              type="text"
                            />
                          </span>
                          <button
                            onClick={() => handleProductQuantityChange("add")}
                            className="qtydown fa fa-plus"
                            title={t("increase")}
                          ></button>
                        </div>
                        <button
                          onClick={() => addToCartJust(data?.data?.deal_id)}
                          type="button"
                          disabled={
                            loadingAddToWishlist ||
                            loadingAddToCart ||
                            removingProductFromWishlist
                              ? true
                              : data?.data?.having_size_color
                              ? Object.is(state.subProduct, null) ||
                                state.subProduct === ""
                                ? true
                                : false
                              : false
                          }
                          className="btn theme_btn"
                        >
                          {t("add_to_cart")}
                        </button>
                        <button
                          onClick={() => addToCart(data?.data?.deal_id)}
                          type="button"
                          disabled={
                            loadingAddToWishlist ||
                            loadingAddToCart ||
                            removingProductFromWishlist
                              ? true
                              : data?.data?.having_size_color
                              ? Object.is(state.subProduct, null) ||
                                state.subProduct === ""
                                ? true
                                : false
                              : false
                          }
                          className="btn theme_btn"
                          style={{ marginRight: "10px", marginLeft: "10px" }}
                        >
                          {t("buy_now")}
                        </button>
                        <button
                          onClick={(e) =>
                            checkProductIsAlreadyWishlisted(
                              userCartDetails.wishList,
                              data?.data?.deal_id
                            )
                              ? removeProductFromWishlist(
                                  e,
                                  data?.data?.deal_id
                                )
                              : addToMyWishlist(e, data?.data?.deal_id)
                          }
                          type="button"
                          disabled={
                            loadingAddToWishlist ||
                            loadingAddToCart ||
                            removingProductFromWishlist
                          }
                          className={
                            checkProductIsAlreadyWishlisted(
                              userCartDetails?.wishList,
                              data?.data?.deal_id
                            )
                              ? "btn btn-wishlist btn-wishlisted"
                              : "btn btn-wishlist"
                          }
                        >
                          {checkProductIsAlreadyWishlisted(
                            userCartDetails?.wishList,
                            data?.data?.deal_id
                          )
                            ? t("remove_from_wishlist")
                            : t("add_to_wishlist")}
                        </button>
                        {/* <button type="button" className="btn btn-compare">
                        {t("compare")}
                      </button> */}
                      </div>
                    )}
                    {data?.data?.delivery_period &&
                      data?.data?.delivery_period !== "" && (
                        <div className="prod-opbtm">
                          <span className="delivery-estimate">
                            {Number(data?.data?.delivery_period) &&
                            Number(data?.data?.delivery_period) <= 1
                              ? `${t("duration")} ${
                                  data?.data?.delivery_period
                                } ${t("day")} `
                              : `${t("duration")} ${
                                  data?.data?.delivery_period
                                } ${t("days")} `}
                            {t("delivery")}
                          </span>
                          <span className="delivery-info">
                            {t("delivery_description")}
                          </span>
                        </div>
                      )}
                  </div>
                  {data?.data?.in_cart > 0 && (
                    <div className="prod-info alert alert-danger">
                      {t("product_demand").replace(
                        "##USERCOUNT##",
                        data?.data?.in_cart
                      )}
                    </div>
                  )}
                  <div className="prod-cate-list">
                    <span>{t("categories")}:</span>
                    {data?.data?.main_category_name &&
                      data?.data?.main_category_name !== "" && (
                        <Link
                          to={`/products?q=${encrypteQueryData(
                            JSON.stringify({
                              ...productFilters,
                              m_c: data?.data?.category_id,
                            })
                          )}`}
                          // title={data?.data?.main_category_name}
                          title={getWordBasedOnLanguage(
                            data?.data?.main_category_name,
                            data?.data?.main_category_name_french
                          )}
                        >
                          {/* {data?.data?.main_category_name} */}
                          {getWordBasedOnLanguage(
                            data?.data?.main_category_name,
                            data?.data?.main_category_name_french
                          )}
                        </Link>
                      )}
                    {data?.data?.sub_category_name &&
                      data?.data?.sub_category_name !== "" && (
                        <>
                          ,{" "}
                          <Link
                            to={`/products?q=${encrypteQueryData(
                              JSON.stringify({
                                ...productFilters,
                                s_c: data?.data?.sub_category_id,
                              })
                            )}`}
                            // title={data?.data?.sub_category_name}
                            title={getWordBasedOnLanguage(
                              data?.data?.sub_category_name,
                              data?.data?.sub_category_name_french
                            )}
                          >
                            {/* {data?.data?.sub_category_name} */}
                            {getWordBasedOnLanguage(
                              data?.data?.sub_category_name,
                              data?.data?.sub_category_name_french
                            )}
                          </Link>
                        </>
                      )}
                    {data?.data?.second_level_category_name &&
                      data?.data?.second_level_category_name !== "" && (
                        <>
                          ,{" "}
                          <Link
                            to={`/products?q=${encrypteQueryData(
                              JSON.stringify({
                                ...productFilters,
                                sl_c: data?.data?.sec_category_id,
                              })
                            )}`}
                            // title={data?.data?.second_level_category_name}
                            title={getWordBasedOnLanguage(
                              data?.data?.second_level_category_name,
                              data?.data?.second_level_category_name_french
                            )}
                          >
                            {/* {data?.data?.second_level_category_name} */}
                            {getWordBasedOnLanguage(
                              data?.data?.second_level_category_name,
                              data?.data?.second_level_category_name_french
                            )}
                          </Link>
                        </>
                      )}
                  </div>
                  {state.subProductCode && (
                    <div className="prod-cate-list">
                      <span>{t("product_code")}:</span>
                      <span>{state.subProductCode}</span>
                    </div>
                  )}
                  <ul>
                    <li>
                      <div className="product-detail-share-options">
                        <FacebookShareButton url={shareUrl} quote={title}>
                          <FacebookIcon
                            size={32}
                            round
                            style={{ position: "absolute", top: 0, left: 0 }}
                          />
                        </FacebookShareButton>
                        <TwitterShareButton url={shareUrl} title={title}>
                          <XIcon
                            size={32}
                            round
                            style={{ position: "absolute", top: 0, left: 0 }}
                          />
                        </TwitterShareButton>
                        <WhatsappShareButton url={shareUrl} title={title}>
                          <WhatsappIcon
                            size={32}
                            round
                            style={{ position: "absolute", top: 0, left: 0 }}
                          />
                        </WhatsappShareButton>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="review-tabs">
              <ul className="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="pills-home-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-desc"
                    type="button"
                    role="tab"
                    aria-controls="pills-desc"
                    aria-selected="true"
                  >
                    {t("description")}
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="pills-review-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-review"
                    type="button"
                    role="tab"
                    aria-controls="pills-review"
                    aria-selected="false"
                    onClick={handleReviewTabChange}
                  >
                    {t("reviews")} ({data?.data?.total_reviews})
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="pills-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="pills-desc"
                  role="tabpanel"
                  aria-labelledby="pills-desc-tab"
                  dangerouslySetInnerHTML={{
                    __html: getWordBasedOnLanguage(
                      data?.data?.deal_description,
                      data?.data?.deal_description_french
                    ),
                  }}
                ></div>
                <div
                  className="tab-pane fade"
                  id="pills-review"
                  role="tabpanel"
                  aria-labelledby="pills-review-tab"
                >
                  {fetchingReviews ? (
                    <Spinner height="200px" />
                  ) : (
                    <>
                      {reviews &&
                      (reviews?.myReviews?.length > 0 ||
                        reviews?.othersReview?.length > 0) ? (
                        <>
                          <p className="review-info">
                            {data?.data?.total_reviews} {t("review_for")}{" "}
                            {/* {data?.data?.deal_title} */}
                            {getWordBasedOnLanguage(
                              data?.data?.deal_title,
                              data?.data?.deal_title_french
                            )}
                          </p>
                          <ul className="review-list-ctnr">
                            {reviews?.myReviews?.map((review) => {
                              return (
                                <li key={review?.id}>
                                  <div className="review-image">
                                    <img
                                      src={
                                        review.user_image
                                          ? review.user_image
                                          : data?.data?.no_profile_image
                                      }
                                      alt={t("you")}
                                    />
                                  </div>
                                  <div className="review-cont">
                                    <p className="review-rating">
                                      {getReviewStars(review?.rating)}
                                    </p>
                                    <h5 className="review-name">
                                      {t("you")}{" "}
                                      {convertTimestampToDate(
                                        review.created_date,
                                        "ddd MMM D YYYY"
                                      )}
                                    </h5>
                                    <p className="review-comments">
                                      {review.review_description}
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                            {reviews?.othersReview?.map((review) => {
                              return (
                                <li key={review?.id}>
                                  <div className="review-image">
                                    <img
                                      src={
                                        review.user_image
                                          ? review.user_image
                                          : data?.data?.no_profile_image
                                      }
                                      alt={t("you")}
                                    />
                                  </div>
                                  <div className="review-cont">
                                    <p className="review-rating">
                                      {getReviewStars(review?.rating)}
                                    </p>
                                    <h5 className="review-name">
                                      {`${review?.firstname} ${
                                        review?.lastname ?? ""
                                      }`}{" "}
                                      {convertTimestampToDate(
                                        review.created_date,
                                        "ddd MMM D YYYY"
                                      )}
                                    </h5>
                                    <p className="review-comments">
                                      {review.review_description}
                                    </p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : (
                        t("no_reviews_found")
                      )}
                      {userInfo && Object.keys(userInfo).length > 0 && (
                        <ReviewForm productId={data?.data?.deal_id} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {data?.data?.related_products &&
              data?.data?.related_products?.length > 0 && (
                <section className="cyr-product-section">
                  <div className="product_section_inner product_slider_block1">
                    <div className="container">
                      <ProductCarouselContainer title={t("related_products")}>
                        <Corousel
                          nav={true}
                          margin={10}
                          xs={1}
                          sm={1}
                          md={2}
                          lg={3}
                          xl={4}
                        >
                          {data?.data?.related_products?.map((product) => {
                            return (
                              <Fragment key={product?.deal_id}>
                                <ProductCard product={product} />
                              </Fragment>
                            );
                          })}
                        </Corousel>
                      </ProductCarouselContainer>
                    </div>
                  </div>
                </section>
              )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
