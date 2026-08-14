import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
  useRef,
} from "react";
import {
  calculateProductTotalPrice,
  changeActiveLink,
  currencyFormatter,
  encrypteQueryData,
  handleResponse,
  productFilters,
  removeSessionID,
  toastConfig,
  updateCartItemsBatch,
} from "../../utils";
import useUserInfo from "../../hooks/useUserInfo";
import BreadCrumb from "../../components/utils/breadcrumb";
import { t } from "i18next";
import {
  useGetMyCartMutation,
  useUpdateMyCartMutation,
} from "../../rtk/networkcalls/cart.query";
import Spinner from "../../components/utils/spinner";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import ProductCartList from "../../components/utils/productCartList";
import { siteSettingsContext } from "../../contexts";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import EmptyCart from "../../components/utils/emptyCart";
import SignInWithGuestOption from "../../forms/signinWithGuestOption";
import AccountBlocked from "../../components/utils/account_blocked";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/cart",
    text: t("my_cart"),
    isActive: true,
  },
];

const Cart = () => {
  const siteInfo = useContext(siteSettingsContext);
  const userInfo = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [emptyCart, setEmptycart] = useState(false);
  const navigate = useNavigate();
  const [myCartDetails, setMyCartDetails] = useState({
    products: [],
    totalWithShipping: 0,
    totalWithoutShipping: 0,
    shippingCost: "0",
    promocode: "",
    isValidPromocode: false,
    discountType: "",
    discount: 0,
    totalDiscount: 0,
  });
  const [myCartProducts, setMyCartProducts] = useState([]);
  const [getMyCart, { isLoading }] = useGetMyCartMutation();
  const [updateMyCart, { isLoading: updatingCartDetails }] =
    useUpdateMyCartMutation();
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let response = await getMyCart();
      if (response.data) {
        if (Number(response.data?.status) === 1) {
          let products = Array.isArray(response.data?.data)
            ? response.data?.data
            : [];
          setMyCartProducts(products);
          if (products.length <= 0) {
            setEmptycart(true);
          }
        } else if (response.data?.status === -10) {
          setIsAccountBlocked(true);
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        navigate("/");
      }
    };
    fetchData();
  }, []);

  const handleCalculationChange = (products, updateCart = true) => {
    let calculations = calculateProductTotalPrice(
      products,
      myCartDetails.shippingCost,
      myCartDetails.discountType,
      myCartDetails.isValidPromocode,
      myCartDetails.discount
    );
    let updatedDetails = {
      products: Array.isArray(calculations?.products)
        ? calculations?.products
        : [],
      totalDiscount: isNaN(calculations.totalDiscount)
        ? 0
        : calculations.totalDiscount,
      totalWithShipping: isNaN(calculations.totalWithShipping)
        ? 0
        : calculations.totalWithShipping,
      totalWithoutShipping: isNaN(calculations.totalWithoutShipping)
        ? 0
        : calculations.totalWithoutShipping,
    };
    setMyCartDetails((prev) => ({
      ...prev,
      ...updatedDetails,
    }));

    if (updateCart) {
      debouncedUpdateUserCart(products);
    }
  };

  useEffect(() => {
    if (myCartProducts && myCartProducts?.length > 0) {
      handleCalculationChange(myCartProducts, false);
    }
  }, [myCartProducts]);

  const handleProductRemove = useCallback(
    (subProductId, cartId) => {
      setLoading((prev) => !prev);
      let products = myCartDetails?.products?.filter((product) => {
        return product.sub_product_id !== subProductId;
      });
      handleCalculationChange(products);

      let message = t("delete_product");
      toast.success(message, toastConfig);

      setLoading((prev) => !prev);
    },
    [myCartDetails.products, handleCalculationChange]
  );

  /*
    const handleQuantityChange = useCallback(
      (quantity, itemId) => {
        if (
          (!isNaN(quantity) && Number(quantity) >= 1 && Number(quantity) <= 25) ||
          quantity === ""
        ) {
          let products = [...myCartDetails.products];
          for (let i = 0; i < products.length; i++) {
            let product = products[i];
            if (product?.item_id === itemId) {
              products[i]["item_quantity"] = quantity;
              break;
            }
          }
          handleCalculationChange(products);
        }
      },
      [myCartDetails.products]
    );
  */

  // now

  // const handleQuantityChange = useCallback(
  //   (type = "increment", itemId) => {
  //     if (type === "increment") {
  //       let products = [...myCartDetails.products];
  //       for (let i = 0; i < products.length; i++) {
  //         let product = products[i];
  //         if (product?.item_id === itemId) {
  //           if (products[i]["item_quantity"] < 25) {
  //             products[i]["item_quantity"] += 1;
  //           }
  //           break;
  //         }
  //       }
  //       handleCalculationChange(products);
  //     } else {
  //       let products = [...myCartDetails.products];
  //       for (let i = 0; i < products.length; i++) {
  //         let product = products[i];
  //         if (product?.item_id === itemId) {
  //           if (products[i]["item_quantity"] > 1) {
  //             products[i]["item_quantity"] -= 1;
  //           }
  //           break;
  //         }
  //       }
  //       handleCalculationChange(products);
  //     }
  //   },
  //   [myCartDetails.products]
  // );

  const handleQuantityChange = useCallback(
    (type = "increment", itemId) => {
      if (type === "increment") {
        let products = [...myCartDetails.products];
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (product?.item_id === itemId) {
            if (products[i]["item_quantity"] < 25) {
              products[i]["item_quantity"] += 1;
            }
            break;
          }
        }
        handleCalculationChange(products);
      } else if (type === "decrement") {
        let products = [...myCartDetails.products];
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (product?.item_id === itemId) {
            if (products[i]["item_quantity"] === 1) {
              // Remove the product from cart if quantity is 1
              products = products.filter((prod) => prod.item_id !== itemId);
              handleProductRemove(product.sub_product_id, product.cart_id);
            } else {
              products[i]["item_quantity"] -= 1;
            }
            break;
          }
        }
        handleCalculationChange(products);
      }
    },
    [myCartDetails.products, handleCalculationChange, handleProductRemove]
  );

  /* 
    const handleOnFocusOut = (quantity, itemId) => {
      if (quantity === "" || Number(quantity) <= 0) {
        quantity = 1;
        let products = [...myCartDetails.products];
        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          if (product?.item_id === itemId) {
            products[i]["item_quantity"] = quantity;
            break;
          }
        }
        handleCalculationChange(products);
      }
    };
  */

  const updateUserCart = async (
    processPayment = false,
    fromModal = false,
    products = null
  ) => {
    if (fromModal) {
      let closeButton = document.getElementById(
        "signin_with_guest_close_button"
      );
      if (closeButton) {
        closeButton?.click();
      }
    }

    // let products = [...myCartDetails.products];
    if (!products) {
      products = [...myCartDetails.products];
    }

    let myCartProducts = [];
    products.forEach((product) => {
      myCartProducts.push({
        deal_id: product?.deal_id,
        cart_id: userInfo?.user_id ? product?.cart_id : -1,
        item_id: product?.item_id,
        sub_product_id: product?.sub_product_id,
        item_quantity: Number(product?.item_quantity),
        currentPrice: Number(product?.currentPrice),
      });
    });
    let response = await updateMyCart({ productDetails: myCartProducts });
    if (response.data) {
      if (Number(response.data?.status) === 1) {
        let totalCartItems = response?.data?.data?.totalCartProducts ?? 0;
        updateCartItemsBatch(totalCartItems);
        if (processPayment) {
          navigate("/checkout");
        } else {
          const isAnyQuantityZero = products.some(
            (product) => product.item_quantity === 0
          );

          if (isAnyQuantityZero) {
            let message = response.data.message;
            toast.success(message, toastConfig);
          }
        }
      } else {
        handleResponse(response?.data, toast, navigate);
      }
    } else {
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
      navigate("/");
    }
  };

  const debouncedUpdateUserCart = useCallback(
    (products) => {
      updateUserCart(false, false, products);
    },
    [myCartDetails.products]
  );

  const handleUpdateCart = async (processPayment = false) => {
    if (processPayment && !userInfo?.user_id) {
      let modalButton = document.getElementById("continueAsGuest");
      if (modalButton) {
        modalButton?.click();
      }
    } else {
      await updateUserCart(processPayment);
      /* 
        let products = [...myCartDetails.products];
        let myCartProducts = [];
        products.forEach((product) => {
          myCartProducts.push({
            deal_id: product?.deal_id,
            cart_id: userInfo?.user_id ? product?.cart_id : -1,
            item_id: product?.item_id,
            sub_product_id: product?.sub_product_id,
            item_quantity: Number(product?.item_quantity),
            currentPrice: Number(product?.currentPrice),
          });
        });

        let response = await updateMyCart({ productDetails: myCartProducts });
        if (response.data) {
          if (Number(response.data?.status) === 1) {
            let totalCartItems = response?.data?.data?.totalCartProducts ?? 0;
            updateCartItemsBatch(totalCartItems);
            if (processPayment) {
              navigate("/checkout");
            } else {
              let message = response.data?.message;
              toast.success(message, toastConfig);
            }
          } else {
            handleResponse(response?.data, toast, navigate);
          }
        } else {
          let message = t("something_went_wrong");
          toast.error(message, toastConfig);
          navigate("/");
        }
      */
    }
  };

  const handleLogout = () => {
    navigate("/");
    removeSessionID();
    localStorage.clear("user_details");
    window.location.reload();
  };
  if (isAccountBlocked) {
    return <AccountBlocked handleLogout={handleLogout} />;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (loading) {
    return (
      <div className="page-options-ctnr">
        <div className="container">
          <Spinner />
        </div>
      </div>
    );
  }
  return (
    <>
      {updatingCartDetails && !isLoading && <TransparentSpinner />}
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      {emptyCart ? (
        <EmptyCart />
      ) : (
        <>
          <div className="cart-page-ctnr">
            <div className="container">
              <div className="cart-page-ctnr-inner">
                <div className="row">
                  <div className="col-12 col-sm-12 col-md-12 col-lg-9 mb-4 mb-lg-0">
                    <div className="cart-lft">
                      <h2 className="page-title">{t("cart")}</h2>
                      <div className="cart-table">
                        <div className="cart-tb-hd">
                          <div className="cart-tb-tr">
                            <div className="cart-tb-td cart-td-prod">
                              {t("product")}
                            </div>
                            <div className="cart-tb-td cart-td-price">
                              {t("price")}
                            </div>
                            <div className="cart-tb-td cart-td-qty">
                              {t("qty")}
                            </div>
                            <div className="cart-tb-td cart-td-total">
                              {t("total")}
                            </div>
                            <div className="cart-tb-td cart-td-act"></div>
                          </div>
                        </div>
                        <div className="cart-tb-bdy">
                          {myCartDetails?.products?.map((product) => {
                            return (
                              <Fragment key={product.sub_product_id}>
                                {/* <ProductCartList
                                  product={product}
                                  currencySymbol={
                                    siteInfo?.siteSettings?.currency_symbol
                                  }
                                  loading={loading}
                                  handleProductRemove={handleProductRemove}
                                  handleQuantityChange={handleQuantityChange}
                                  // handleOnFocusOut={handleOnFocusOut}
                                /> */}
                                <ProductCartList
                                  product={product}
                                  currencySymbol={
                                    siteInfo?.siteSettings?.currency_symbol
                                  }
                                  loading={loading}
                                  handleProductRemove={handleProductRemove}
                                  handleQuantityChange={(type) =>
                                    handleQuantityChange(type, product.item_id)
                                  }
                                />
                              </Fragment>
                            );
                          })}
                        </div>
                      </div>
                      <div className="btn-blk">
                        <input
                          type="button"
                          onClick={() =>
                            navigate(
                              `/products?q=${encrypteQueryData(
                                JSON.stringify({ ...productFilters })
                              )}`
                            )
                          }
                          value={t("continue_shopping")}
                          className="btn theme_btn"
                        />
                        {/*
                          <input
                          type="button"
                          value={t("update_cart")}
                          title={t("update_cart")}
                          disabled={updatingCartDetails}
                          onClick={() => handleUpdateCart(false)}
                          className="btn border-btn"
                        />
                      */}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-3">
                    <div className="cart-rgt">
                      <h3 className="page-title">{t("your_cart")}</h3>
                      {/* <p className="sub-total">
                    <span>{t("sub_total")}</span>
                    <span className="tot-value">
                      {`${siteInfo?.siteSettings?.currency_symbol}`}{" "}
                      {currencyFormatter(myCartDetails?.totalWithoutShipping) ??
                        "0"}
                    </span>
                  </p> */}
                      <div className="cart-accord-ctnr">
                        <div
                          className="accordion"
                          id="accordionPanelsStayOpenExample"
                        >
                          {/* <div className="accordion-item"> */}
                          {/* <h2
                          style={{ display: "none" }}
                          className="accordion-header"
                          id="panelsStayOpen-headingOne"
                        >
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#panelsStayOpen-collapseOne"
                            aria-expanded="true"
                            aria-controls="panelsStayOpen-collapseOne"
                          >
                            {t("shipping_fee")}
                          </button>
                        </h2> */}
                          {/* <div
                          style={{ display: "none" }}
                          id="panelsStayOpen-collapseOne"
                          className="accordion-collapse collapse show"
                          aria-labelledby="panelsStayOpen-headingOne"
                        >
                          <div className="accordion-body">
                            <select
                              className="form-select form-select-lg"
                              aria-label=".form-select-lg example"
                            >
                              <option selected>Country</option>
                              <option value="1">One</option>
                              <option value="2">Two</option>
                              <option value="3">Three</option>
                            </select>
                            <select
                              className="form-select form-select-lg"
                              aria-label=".form-select-lg example"
                            >
                              <option selected>City</option>
                              <option value="1">One</option>
                              <option value="2">Two</option>
                              <option value="3">Three</option>
                            </select>
                            <select
                              className="form-select form-select-lg"
                              aria-label=".form-select-lg example"
                            >
                              <option selected>District</option>
                              <option value="1">One</option>
                              <option value="2">Two</option>
                              <option value="3">Three</option>
                            </select>
                            <select
                              className="form-select form-select-lg mb-3"
                              aria-label=".form-select-lg example"
                            >
                              <option selected>Ward</option>
                              <option value="1">One</option>
                              <option value="2">Two</option>
                              <option value="3">Three</option>
                            </select>
                          </div>
                        </div> */}
                          {/* </div> */}
                          {/* <p className="shipping-total">
                        <span>{t("shipping_fee")}:</span>
                        <span className="tot-value">
                          {`${siteInfo?.siteSettings?.currency_symbol}`}{" "}
                          {currencyFormatter(myCartDetails?.shippingCost) ??
                            "0"}
                        </span>
                      </p> */}
                          {/* <button
                        style={{ display: "none" }}
                        type="button"
                        className="btn border-btn"
                        disabled
                      >
                        Update
                      </button> */}
                          {/* <div className="accordion-item">
                        <h2
                          className="accordion-header"
                          id="panelsStayOpen-headingTwo"
                        >
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#panelsStayOpen-collapseTwo"
                            aria-expanded="false"
                            aria-controls="panelsStayOpen-collapseTwo"
                          >
                            {t("apply_promocode")}
                          </button>
                        </h2>
                        <div
                          id="panelsStayOpen-collapseTwo"
                          className="accordion-collapse collapse"
                          aria-labelledby="panelsStayOpen-headingTwo"
                        >
                          <div className="accordion-body">
                            <input
                              className="form-control form-control-lg"
                              type="text"
                              placeholder={t("enter_promocode")}
                              aria-label={t("enter_promocode")}
                            />
                            <button
                              type="button"
                              className="btn theme_btn"
                              disabled={
                                myCartDetails?.promocode?.length <= 0
                                  ? true
                                  : false
                              }
                            >
                              {t("apply")}
                            </button>
                          </div>
                        </div>
                      </div> */}
                        </div>
                      </div>
                      <p className="total">
                        <span>{t("total")}</span>
                        <span className="tot-value">
                          {`${siteInfo?.siteSettings?.currency_symbol}`}{" "}
                          {currencyFormatter(
                            myCartDetails?.totalWithShipping
                          ) ?? "0"}
                        </span>
                      </p>
                      {myCartDetails?.totalWithShipping > 0 && (
                        <button
                          type="button"
                          disabled={updatingCartDetails}
                          className="btn theme_btn"
                          onClick={() => handleUpdateCart(true)}
                        >
                          {t("payment_process")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!userInfo?.user_id && (
            <>
              <Link
                id="continueAsGuest"
                data-bs-toggle="modal"
                data-bs-target="#signinModalWithGuest"
                style={{ display: "none" }}
              />
              <SignInWithGuestOption
                updateUserCart={updateUserCart}
                updatingCartDetails={updatingCartDetails}
                loginImage={siteInfo?.siteSettings?.login_page_image}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Cart;
