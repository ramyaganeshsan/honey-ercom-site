import React, { useContext, useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { Link, useNavigate } from "react-router-dom";
import { siteSettingsContext, userCartDetailsContext } from "../../contexts";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../../rtk/networkcalls/wishlist.query.js";
import { useAddToMyCartMutation } from "../../rtk/networkcalls/cart.query";
import {
  checkProductIsAlreadyWishlisted,
  // getUserInfo,
  getWordBasedOnLanguage,
  handleResponse,
  setSessionID,
  toastConfig,
  updateCartItemsBatch,
  updateWishlistItemsBatch,
} from "../../utils";
import { toast } from "react-toastify";
import Spinner from "../../components/utils/spinner";
import Price from "./price";
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

const ProductCard = ({ product }) => {
  // const [userInfo] = useState(getUserInfo);

  const [imageLoading, setImageLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const navigate = useNavigate();
  const siteInfo = useContext(siteSettingsContext);
  const userCartDetails = useContext(userCartDetailsContext);
  const shareOptionsRef = useRef(null);

  const [addToWishlist, { isLoading: loadingAddToWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingProductFromWishlist }] =
    useRemoveFromWishlistMutation();
  const [addToMyCart, { isLoading: loadingAddToCart }] =
    useAddToMyCartMutation();

  useEffect(() => {
    if (showShareOptions) {
      document.addEventListener("click", handleClickOutside, true);
    } else {
      document.removeEventListener("click", handleClickOutside, true);
    }

    window.addEventListener("scroll", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("scroll", handleClickOutside);
    };
  }, [showShareOptions]);

  const handleClickOutside = (event) => {
    if (
      shareOptionsRef.current &&
      !shareOptionsRef.current.contains(event.target)
    ) {
      setShowShareOptions(false);
    }
  };

  const addToCart = async (id) => {
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
  };

  const addToMyWishlist = async (e, id) => {
    // if (userInfo?.user_id) {
    e?.target?.classList?.add("prod-wishlisted");
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
          userCartDetails?.addProductToUserWishList(id);
          // navigate("/wishlist");
        }
      } else {
        e?.target?.classList?.remove("prod-wishlisted");
        handleResponse(response?.data, toast, navigate, siteInfo?.refetch);
      }
    } else {
      e?.target?.classList?.remove("prod-wishlisted");
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

  const removeProductFromWishlist = async (e, id) => {
    // if (userInfo?.user_id) {
    e?.target?.classList?.remove("prod-wishlisted");
    let response = await removeFromWishlist({ productId: id });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let message = response?.data?.message;
        let totalWishlistCount = response?.data?.data?.totalWishListItems ?? 0;
        toast.success(message, toastConfig);
        updateWishlistItemsBatch(totalWishlistCount);

        userCartDetails?.removeProductFromUserWishlist(id);
      } else {
        e?.target?.classList?.add("prod-wishlisted");
        handleResponse(response?.data, toast, navigate, siteInfo?.refetch);
      }
    } else {
      e?.target?.classList?.add("prod-wishlisted");
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

  // const handleImageOnload = (e) => {
  //   if (e.target.complete) {
  //     setImageLoading(false);
  //   }
  // };
  const handleImageOnload = () => {
    setImageLoading(false);
  };
  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareUrl = `${env.FRONT_END_BASE_URL}/product_detail?q=${product?.deal_key}`;
  const title = getWordBasedOnLanguage(
    siteInfo?.siteSettings?.site_name,
    siteInfo?.siteSettings?.site_name_french
  );

  // const handleShare = async (link) => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: getWordBasedOnLanguage(
  //           siteInfo?.siteSettings?.site_name,
  //           siteInfo?.siteSettings?.site_name_french
  //         ),
  //         text: siteInfo?.siteSettings?.meta_description,
  //         url: link,
  //       });
  //     } catch (error) {
  //       console.error("Error sharing:", error);
  //     }
  //   } else {
  //     if (navigator.clipboard) {
  //       navigator.clipboard
  //         .writeText(link)
  //         .then(() => {
  //           toast.info(t("copied"), toastConfig);
  //         })
  //         .catch((error) => {
  //           console.error("Could not copy text: ", error);
  //         });
  //     }
  //   }
  // };

  return (
    <div className="item">
      <div className="product_block text-center">
        <div className="prod_img">
          <div>
            {imageLoading && <Spinner image height="inherit" />}

            <Link
              to={`/product_detail?q=${product?.deal_key}`}
              // title={product.deal_title}
              title={getWordBasedOnLanguage(
                product.deal_title,
                product?.deal_title_french
              )}
            >
              {/* {imageLoading && <Spinner image height="inherit" />} */}
              <img
                style={{ visibility: imageLoading ? "hidden" : "visible" }}
                onLoad={handleImageOnload}
                onError={handleImageOnload}
                // loading="lazy"
                src={product.image}
                alt=""
                className="productImage"
              />
            </Link>
          </div>

          <div className="product-overlay" style={{ position: "absolute" }}>
            <ul>
              <li>
                <span
                  onClick={
                    !loadingAddToWishlist &&
                    !loadingAddToCart &&
                    !removingProductFromWishlist
                      ? (e) =>
                          checkProductIsAlreadyWishlisted(
                            userCartDetails?.wishList,
                            product.deal_id
                          )
                            ? removeProductFromWishlist(e, product.deal_id)
                            : addToMyWishlist(
                                e,
                                product.deal_id,
                                product?.inStock
                              )
                      : null
                  }
                  // disabled={product?.inStock ? false : true}
                  title={t("wishlist")}
                  className={
                    checkProductIsAlreadyWishlisted(
                      userCartDetails?.wishList,
                      product.deal_id
                    )
                      ? "prod-wishlist prod-wishlisted"
                      : "prod-wishlist"
                  }
                >
                  {t("wishlist")}
                </span>
              </li>
              <li>
                <span
                  // onClick={toggleShareOptions}
                  // onMouseEnter={toggleShareOptions}
                  // onMouseLeave={toggleShareOptions}
                  onClick={() => setShowShareOptions(true)}
                  onMouseEnter={() => setShowShareOptions(true)}
                  onMouseLeave={() => setShowShareOptions(false)}
                  title="Share"
                  className="prod-share"
                >
                  Share
                </span>
                {showShareOptions && (
                  <div
                    onMouseEnter={() => setShowShareOptions(true)}
                    onMouseLeave={() => setShowShareOptions(false)}
                    ref={shareOptionsRef}
                    className="share-options"
                  >
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
                )}
              </li>
              <li>
                <Link
                  to={`/product_detail?q=${product?.deal_key}`}
                  title={t("zoom")}
                  className="prod-zoom product-menu-zoom"
                >
                  {t("zoom")}
                </Link>
              </li>
              <li>
                {product?.having_size_color ? (
                  <Link
                    to={`/product_detail?q=${product?.deal_key}`}
                    title={t("add_to_cart")}
                    className="prod-addtocart product-menu-add-cart"
                  >
                    {t("add_to_cart")}
                  </Link>
                ) : (
                  <span
                    onClick={
                      !loadingAddToWishlist &&
                      !loadingAddToCart &&
                      !removingProductFromWishlist &&
                      product?.inStock
                        ? () => addToCart(product.deal_id)
                        : null
                    }
                    disabled={product?.inStock ? false : true}
                    title={
                      product?.inStock ? t("add_to_cart") : t("out_of_stock")
                    }
                    className={
                      product?.inStock
                        ? "prod-addtocart"
                        : "prod-addtocart cyr-product-not-allowed"
                    }
                  >
                    {t("add_to_cart")}
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>
        {/* {!imageLoading && ( */}
        <div className="product_content">
          <span className="star">{getStars(product?.ratings)}</span>
          <Link
            to={`/product_detail?q=${product?.deal_key}`}
            // title={product.deal_title}
            title={getWordBasedOnLanguage(
              product.deal_title,
              product?.deal_title_french
            )}
          >
            {/* {product.deal_title} */}
            {getWordBasedOnLanguage(
              product.deal_title,
              product?.deal_title_french
            )}
          </Link>
          {/* <span className="product_card_product_name">
              {product.deal_title}
            </span> */}
          {/* <div className="prod_price_blk">
            <strike>{`${siteInfo?.siteSettings?.currency_symbol} ${product.deal_price}`}</strike>
            &nbsp;
            <span className="price">{`${siteInfo?.siteSettings?.currency_symbol} ${product.deal_value}`}</span>
          </div> */}
          <Price
            currentSymbol={siteInfo?.siteSettings?.currency_symbol}
            originalPrice={product.deal_price}
            discountPrice={product.deal_value}
          />
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default ProductCard;
