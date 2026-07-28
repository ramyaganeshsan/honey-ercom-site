import React, { useEffect, useState, useContext, useLayoutEffect } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { t } from "i18next";
import ProfileSidebarMenu from "../../components/menu/profileSidebarMenu";
import Spinner from "../../components/utils/spinner";
import {
  useGetMyOrdersQuery,
  useCancelMyOrderMutation,
  useGenerateInvoiceMutation,
  useGetOrdersDetailsMutation,
} from "../../rtk/networkcalls/orders.query";
import {
  handleResponse,
  toastConfig,
  updateCartItemsBatch,
  setSessionID,
} from "../../utils";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import NoDataFound from "../../components/utils/noDataFound";
import { siteSettingsContext } from "../../contexts";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import CancelOrder from "../../forms/cancelOrder";
import { cancelOrderSchema } from "../../validation/orders.validation";
import { extractErrors, validateForm } from "../../validation";
import { useAddToMyCartMutation } from "../../rtk/networkcalls/cart.query";
import { GrNotes } from "react-icons/gr";
import { IoMdDownload } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/my_orders",
    text: t("orders"),
    isActive: true,
  },
];

const getStatus = (products) => {
  let status = "order_placed";
  if (products.some((product) => product.delivery_status === 4)) {
    status = "Order_has_been_delivered";
  } else if (products.some((product) => product.delivery_status === 3)) {
    status = "Order_out_for_delivery";
  } else if (products.some((product) => product.delivery_status === 2)) {
    status = "Shipped_at_delivery_center";
  } else if (products.some((product) => product.delivery_status === 1)) {
    status = "Order_is_packed";
  } else if (products.some((product) => product.admin_status === 1)) {
    status = "confirmed";
  }
  let totalProducts = products.length;
  let cancelledProducts = 0;
  let otherProducts = 0;

  products.forEach((product) => {
    if (Number(product.delivery_status) === 6) {
      cancelledProducts += 1;
    } else if (Number(product.delivery_status) !== 0) {
      otherProducts += 1;
    }
  });

  // if (otherProducts > 0) {
  //   status = "order_processing";
  // }

  if (cancelledProducts > 0 && Number(cancelledProducts) === totalProducts) {
    status = "order_cancelled";
  }

  return status;
};

const initialErrorState = {
  cartId: "",
  orderId: "",
  cancellationReason: "",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let siteInfo = useContext(siteSettingsContext);
  let [state, setState] = useState({
    data: [],
    noOrdersFound: false,
    isLoadingDetails: false,
    selectedOrderId: null,
  });
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  let { data, isLoading, refetch, isFetching } = useGetMyOrdersQuery();
  let [cancelOrderDetails, setCancelOrderDetails] = useState({
    cartId: "",
    orderId: "",
  });
  const [errors, setErrors] = useState(initialErrorState);
  let [cancelMyOrder, { isLoading: cancellingOrder }] =
    useCancelMyOrderMutation();
  let [addToMyCart, { isLoading: loadingAddToCart }] = useAddToMyCartMutation();
  let [generateInvoice] = useGenerateInvoiceMutation();
  let [getOrdersDetails, { isLoading: isDetailsLoading }] =
    useGetOrdersDetailsMutation();

  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    if (data?.status === 1) {
      setState({
        data: Array.isArray(data.data) ? data.data : [],
        noOrdersFound: data?.data?.length <= 0,
      });
    } else {
      handleResponse(data, toast, navigate);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [location]);

  const handleCancelOrderModal = async (cartId, orderId) => {
    setCancelOrderDetails((prev) => ({
      ...prev,
      cartId,
      orderId,
    }));

    let modalButton = document.getElementById("cancelReason");
    if (modalButton) {
      modalButton?.click();
    }
  };

  const closeModal = () => {
    let closeButton = document.getElementById("cancel_order_close_button");
    if (closeButton) {
      closeButton?.click();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target).entries());
    data = {
      ...data,
      cartId: cancelOrderDetails.cartId,
      orderId: cancelOrderDetails.orderId,
    };

    let validation = validateForm(cancelOrderSchema, data);
    setErrors(initialErrorState);

    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else if (!cancelOrderDetails?.cartId || !cancelOrderDetails?.orderId) {
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
      closeModal();
    } else {
      let response = await cancelMyOrder(data);
      if (response.data) {
        if (Number(response.data?.status) === 1) {
          let message = response.data?.message;
          toast.success(message, toastConfig);
          setCancelOrderDetails({ cartId: "", orderId: "" });
          closeModal();
          e.target.reset();
          refetch();
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        closeModal();
        e.target.reset();
        navigate("/");
      }
    }
  };

  const handleBuyAgain = async (products) => {
    const cartDetails = products.map((product) => ({
      dealId: product.dealID,
      quantity: product.quantity,
      sizeId: product.sizeId,
    }));

    try {
      let response = await addToMyCart({ products: cartDetails });
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
    } catch (error) {
      console.error("Failed to add to cart", error);
      let message = t("something_went_wrong");
      toast.error(message, toastConfig);
    }
  };

  // const handleDownloadInvoice = async (orderId) => {
  //   try {
  //     const response = await generateInvoice({ orderId });

  //     if (response.data) {
  //       // If you receive the file directly
  //       // const blob = new Blob([response.data], { type: "application/pdf" });
  //       const url = URL.createObjectURL(response.data);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = `invoice_${orderId}.pdf`;
  //       document.body.appendChild(a);
  //       a.click();
  //       a.remove();
  //     } else {
  //       toast.error("Failed to generate invoice", { position: "top-right" });
  //     }
  //   } catch (error) {
  //     console.error("Failed to download invoice", error);
  //     toast.error("Failed to download invoice", { position: "top-right" });
  //   }
  // };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await generateInvoice(orderId).unwrap();
      const blob = new Blob([response], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const handleTrackingShipment = async (trackingId) => {
    const trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingId}`;

    window.open(trackingUrl, "_blank");
  };

  const handleOrderDetails = async (orderId) => {
    try {
      setState((prevState) => ({
        ...prevState,
        isLoadingDetails: true,
      }));

      const response = await getOrdersDetails({ orderId });

      if (response.data && Array.isArray(response.data.data)) {
        setState((prevState) => ({
          ...prevState,
          isLoadingDetails: false,
          selectedOrderId: orderId,
        }));
        setOrderDetails(response.data.data);
        setSelectedOrderId(orderId);
      } else {
        throw new Error("Invalid data received");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details", { position: "top-right" });
      setState((prevState) => ({
        ...prevState,
        isLoadingDetails: false,
      }));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!isLoading && state?.noOrdersFound) {
    return <NoDataFound />;
  }

  return (
    <>
      <Link
        id="cancelReason"
        data-bs-toggle="modal"
        data-bs-target="#cancelReasonModal"
        style={{ display: "none" }}
      />
      {isFetching && <TransparentSpinner />}
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
                <ProfileSidebarMenu activeLink="my_orders" />
              </div>
              <div className="wishlist-rgt">
                <h2 className="page-title profile-page-title">{t("orders")}</h2>

                {state?.noOrdersFound ? (
                  <NoDataFound />
                ) : (
                  state?.data?.length > 0 &&
                  state?.data?.map((order) => {
                    return (
                      <div
                        key={order?.order_id}
                        className="my-orders-container"
                      >
                        <div className="my-orders-order-number">
                          <h3>
                            {t("order_number")} : {order?.order_id}
                          </h3>

                          <div className="my-orders-actions">
                            {order?.DHL_shipmet_trackingID &&
                              order?.DHL_shipmet_trackingID !== "" && (
                                <button
                                  onClick={() =>
                                    handleTrackingShipment(
                                      order?.DHL_shipmet_trackingID
                                    )
                                  }
                                  className="btn theme_btn"
                                  style={{ marginLeft: "6px" }}
                                >
                                  {t("Track My Order")}
                                </button>
                              )}
                            <button
                              onClick={() => handleBuyAgain(order.products)}
                              className="btn theme_btn"
                              style={{ marginLeft: "6px" }}
                            >
                              {t("buy_again")}
                            </button>
                            &nbsp;
                            <button
                              onClick={() => handleOrderDetails(order.order_id)}
                              className="btn theme_btn"
                              style={{ marginLeft: "6px" }}
                            >
                              {/*  {t("details")} */}
                              <GrNotes
                                style={{ width: "20px", height: "20px" }}
                                title="Order Details"
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadInvoice(order.order_id)
                              }
                              className="btn theme_btn"
                              style={{ marginLeft: "6px" }}
                            >
                              {/* {t("download_invoice")} */}
                              <IoMdDownload
                                style={{ width: "20px", height: "20px" }}
                                title="Download Invoice"
                              />
                            </button>
                            {!order?.is_cancel && (
                              <>
                                <button
                                  onClick={() =>
                                    handleCancelOrderModal(
                                      order?.cart_id,
                                      order?.order_id
                                    )
                                  }
                                  class="btn theme_btn without_background"
                                  style={{ marginLeft: "6px" }}
                                >
                                  {/* {t("cancel")} */}
                                  <AiOutlineClose
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                    }}
                                    title="Cancel"
                                  />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="my-orders-order-details">
                          <p className="my-orders-order-details-info">
                            <span>{t("order_status")}</span>
                            <span>:</span>
                            <span>{t(getStatus(order.products))}</span>
                          </p>
                          <p className="my-orders-order-details-info">
                            <span>{t("order_date")}</span>
                            <span>:</span>
                            <span>
                              {dayjs
                                .unix(order?.transaction_date)
                                .format("YYYY-MM-DD hh:ss:mm A")}
                            </span>
                          </p>
                          <p className="my-orders-order-details-info">
                            <span>{t("order_total")}</span>
                            <span>:</span>
                            <span>{`${siteInfo?.siteSettings?.currency_symbol} ${order?.grand_total_price}`}</span>
                          </p>

                          {selectedOrderId === order.order_id &&
                            orderDetails.length > 0 && (
                              <div style={{ width: "100%" }}>
                                <table
                                  style={{ width: "100%", padding: "0px 10px" }}
                                >
                                  <thead
                                    style={{
                                      backgroundColor: "#eee",
                                      padding: "0px 10px",
                                    }}
                                  >
                                    <tr style={{ width: "100%" }}>
                                      <th
                                        style={{
                                          padding: "16px 10px",
                                          textAlign: "center",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {t("product")}
                                      </th>
                                      <th
                                        style={{
                                          padding: "16px 10px",
                                          textAlign: "center",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {t("price")}
                                      </th>
                                      <th
                                        style={{
                                          padding: "16px 10px",
                                          textAlign: "center",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {t("total")}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ backgroundColor: "white" }}>
                                    {orderDetails.map((item) => (
                                      <tr key={item.id}>
                                        <td
                                          style={{
                                            display: "flex",
                                            padding: "0px 10px",
                                          }}
                                        >
                                          <img
                                            src={item.image}
                                            alt={item.deal_title}
                                            style={{
                                              maxWidth: "60px",
                                            }}
                                          />
                                          <p
                                            style={{
                                              padding: "0px 10px",
                                              textAlign: "center",
                                              marginTop: "45px",
                                            }}
                                          >
                                            {item.deal_title}
                                          </p>
                                        </td>
                                        <td
                                          style={{
                                            padding: "0px 10px",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            direction:
                                              t.language === "ar"
                                                ? "rtl"
                                                : "ltr",
                                          }}
                                        >
                                          {`${item.item_quantity} x ${siteInfo?.siteSettings?.currency_symbol} ${item.currentPrice}`}
                                        </td>
                                        <td
                                          style={{
                                            padding: "0px 10px",
                                            textAlign: "center",
                                            marginBottom: "15px",
                                          }}
                                        >
                                          {`${
                                            siteInfo?.siteSettings
                                              ?.currency_symbol
                                          } ${
                                            item.currentPrice *
                                            item.item_quantity
                                          }`}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal change-password-modal fade"
        id="cancelReasonModal"
        tabIndex="-1"
        aria-labelledby="changePasswordLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <button
                type="button"
                id="cancel_order_close_button"
                className="btn-close"
                disabled={cancellingOrder}
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
              <h2 className="page-title">{t("calcel_order")}</h2>
              <CancelOrder
                errors={errors}
                cancellingOrder={cancellingOrder}
                handleFormSubmit={handleFormSubmit}
                orderId={cancelOrderDetails?.orderId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyOrders;
