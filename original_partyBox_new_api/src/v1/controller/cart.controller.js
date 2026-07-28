const {
  getMyCartProducts,
  updateCart,
  removeAllCartProducts,
  addToCart,
  updateCartSession,
  getCartDetailsUsingSessionDetails,
  removeCartDetailsFromSession,
  getSessionCartProductDetails,
  getProductDetailSession,
} = require("../services/cart.services");
const { createSessionUser } = require("../services/common.services");

const {
  getStatusCode,
  getMessage,
  isValidUserDetails,
  serializeData,
  deserializeData,
  getCurrentTimestamp,
  getUUID,
  getUserSessionDetails,
} = require("../utils");
const logger = require("../utils/logger");

exports.getMyCartProducts = async (req, res, next) => {
  try {
    let { userDetails } = req;
    let sessionID = req.userSessionID;

    if (!sessionID && !isValidUserDetails(userDetails)) {
      return res.send({
        status: getStatusCode("success"),
        message: "",
        data: [],
      });
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      console.log("calling one of cart controller");
      let sessionCartDetails = await getUserSessionDetails(sessionID);
      console.log("calling one of cart controller");

      if (
        sessionCartDetails &&
        sessionCartDetails.length > 0 &&
        !sessionCartDetails[0]["isMovedToUsers"]
      ) {
        if (sessionCartDetails[0]["cart"]) {
          let deserializedCartDetails = deserializeData(
            sessionCartDetails[0]["cart"]
          );
          let cartDetails = deserializedCartDetails;
          let cartInfo = await getCartDetailsUsingSessionDetails(cartDetails);

          let modifiedCartDetails = [];
          cartDetails.forEach((cartDetail) => {
            for (let index = 0; index < cartInfo.length; index++) {
              const element = cartInfo[index];
              if (
                element["size_id"] == cartDetail["sizeId"] &&
                element["deal_id"] == cartDetail["dealId"]
              ) {
                modifiedCartDetails.push({
                  item_quantity: cartDetail["quantity"],
                  item_id: cartDetail["item_id"],
                  ...element,
                });
              }
            }
          });

          return res.send({
            status: getStatusCode("success"),
            message: "",
            data: Array.isArray(modifiedCartDetails) ? modifiedCartDetails : [],
          });
        } else {
          return res.send({
            status: getStatusCode("success"),
            message: "",
            data: [],
          });
        }
      } else {
        return res.send({
          status: getStatusCode("session_expired"),
          message: getMessage("session_expired", req.lang),
          data: [],
        });
      }
    }

    let response = await getMyCartProducts(userDetails?.user_id);
    return res.send({
      status: getStatusCode("success"),
      message: "",
      data: response,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    let { productDetails: products } = req.body;

    let { userDetails } = req;

    let sessionID = req.userSessionID;

    let response = {
      status: getStatusCode("success"),
      message: getMessage("cart_updated_successfully", req.lang),
      data: {
        totalCartProducts: 0,
      },
    };

    if (!sessionID && !isValidUserDetails(userDetails)) {
      response = {
        status: getStatusCode("session_expired"),
        message: getMessage("session_expired", req.lang),
        data: {
          totalCartProducts: 0,
        },
      };
      return res.send(response);
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      if (products?.length <= 0) {
        let updatedResponse = await removeCartDetailsFromSession(sessionID);
        if (!updatedResponse?.status) {
          response = {
            status: getStatusCode("failed"),
            message:
              updatedResponse?.message ?? getMessage("try_again", req.lang),
            data: {
              totalCartProducts: 0,
            },
          };
          return res.send(response);
        }
        return res.send(response);
      }
      console.log("calling two of cart controller");

      let sessionCartDetails = await getUserSessionDetails(sessionID);
      console.log("calling two of cart controller");

      if (
        sessionCartDetails &&
        sessionCartDetails.length > 0 &&
        !sessionCartDetails[0]["isMovedToUsers"]
      ) {
        let productIds = products.map((product) =>
          Number(product.sub_product_id)
        );
        let productDetails = await getSessionCartProductDetails(productIds);
        let modifiedCartProductDetails = [];

        for (let i = 0; i < products.length; i++) {
          let product = products[i];
          for (let j = 0; j < productDetails.length; j++) {
            let producDetail = productDetails[j];
            if (producDetail["id"] == product["sub_product_id"]) {
              if (
                producDetail["sub_product_quantity"] < product["item_quantity"]
              ) {
                response = {
                  status: getStatusCode("failed"),
                  message: getMessage("product_quantity_is_not_enough").replace(
                    "##PRODUCT_NAME##",
                    producDetail["deal_title"]
                  ),
                  data: {
                    totalCartProducts: products.length,
                  },
                };
                return res.send(response);
              } else {
                modifiedCartProductDetails.push({
                  item_id: product["item_id"],
                  dealId: product["deal_id"],
                  quantity: product["item_quantity"],
                  sub_product_id: product["sub_product_id"],
                });
              }
            }
          }
        }

        response = {
          status: getStatusCode("success"),
          message: getMessage("cart_updated_successfully", req.lang),
          data: {
            totalCartProducts: products.length,
          },
        };
        if (modifiedCartProductDetails.length !== products.length) {
          response["message"] = getMessage(
            "product_removed_or_blocked",
            req.lang
          );
        } else {
          let modifiedSessionProducts = [];

          if (sessionCartDetails[0]["cart"]) {
            let deserializedCartDetails = deserializeData(
              sessionCartDetails[0]["cart"]
            );
            let cartDetails = deserializedCartDetails;
            for (let i = 0; i < cartDetails.length; i++) {
              let cartProduct = cartDetails[i];
              for (let j = 0; j < modifiedCartProductDetails.length; j++) {
                let product = modifiedCartProductDetails[j];
                if (product["item_id"] == cartProduct["item_id"]) {
                  modifiedSessionProducts.push({
                    item_id: cartProduct["item_id"],
                    dealId: cartProduct["dealId"],
                    sizeId: cartProduct["sizeId"],
                    quantity: product["quantity"],
                  });
                }
              }
            }
            let status = await updateCartSession(
              sessionID,
              serializeData(modifiedSessionProducts)
            );
            if (status) {
              response["status"] = getStatusCode("success");
              response["message"] = getMessage(
                "cart_updated_successfully",
                req.lang
              );
              response["data"]["totalCartProducts"] =
                modifiedSessionProducts.length;
            } else {
              response["status"] = getMessage("failed");
              response["message"] = getMessage("try_again", req.lang);
            }
          } else {
            response["status"] = getStatusCode("failed");
            response["message"] = getMessage("something_went_wrong_error");
          }
        }
        return res.send(response);
      } else {
        response = {
          status: getStatusCode("session_expired"),
          message: getMessage("session_expired", req.lang),
          data: {
            totalCartProducts: 0,
          },
        };
        return res.send(response);
      }
    }

    if (products?.length <= 0) {
      let updatedResponse = await removeAllCartProducts(userDetails);
      if (!updatedResponse?.status) {
        response = {
          status: getStatusCode("failed"),
          message:
            updatedResponse?.message ?? getMessage("try_again", req.lang),
          data: {
            totalCartProducts: 0,
          },
        };
        return res.send(response);
      }
      return res.send(response);
    }

    let updateResponse = await updateCart({ products, userDetails });
    response = {
      status: getStatusCode("success"),
      message: getMessage("cart_updated_successfully", req.lang),
      data: {
        totalCartProducts: updateResponse?.totalCartProducts ?? 0,
      },
    };

    if (updateResponse?.status === -1) {
      response = {
        status: getStatusCode("failed"),
        message: updateResponse?.message,
        data: {
          totalCartProducts: 0,
        },
      };
    } else if (!updateResponse?.status) {
      response = {
        status: getStatusCode("failed"),
        message: getMessage("try_again", req.lang),
        data: {
          totalCartProducts: 0,
        },
      };
    }

    res.send(response);
  } catch (err) {
    console.log(err?.message);
    logger.error(err);
    next(err);
  }
};

// exports.addToCart = async (req, res, next) => {
//   try {
//     let producDetails = req.body;
//     let { userDetails } = req;
//     let sessionID = req.userSessionID;
//     let isNewSession = false;
//     console.log("producDetails : ", producDetails);
//     let response = {
//       status: getStatusCode("failed"),
//       message: getMessage("try_again", req.lang),
//       data: {
//         totalCartProducts: 0,
//       },
//       sessionID: sessionID,
//     };

//     if (!sessionID && !isValidUserDetails(userDetails)) {
//       sessionID = getUUID();
//       let insertID = await createSessionUser(sessionID);
//       if (!insertID) {
//         response["status"] = getStatusCode("failed");
//         response["message"] = getMessage("try_again", req.lang);
//         return res.send(response);
//       }
//       isNewSession = true;
//       response["sessionID"] = sessionID;
//     }

//     if (sessionID && !isValidUserDetails(userDetails)) {
//       let subProductDetails = await getProductDetailSession(
//         Number(producDetails.dealId),
//         producDetails?.sizeId ?? null
//       );

//       console.log("subProductDetails controller : ", subProductDetails);
//       if (!subProductDetails || subProductDetails.length <= 0) {
//         response["status"] = getStatusCode("failed");
//         response["message"] = getMessage("product_not_found", req.lang);
//         return res.send(response);
//       } else if (
//         subProductDetails &&
//         subProductDetails.length > 0 &&
//         subProductDetails[0]["quantity"] < (producDetails?.quantity ?? 1)
//       ) {
//         response["status"] = getStatusCode("failed");
//         response["message"] = getMessage(
//           "product_quantity_is_not_enough"
//         ).replace("##PRODUCT_NAME##", subProductDetails[0]["deal_title"]);
//         return res.send(response);
//       }

//       if (isNewSession) {
//         let cartDetails = [
//           {
//             item_id: getCurrentTimestamp(),
//             dealId: Number(producDetails.dealId),
//             sizeId: producDetails?.sizeId ? Number(producDetails?.sizeId) : 0,
//             quantity: producDetails?.quantity
//               ? Number(producDetails?.quantity)
//               : 1,
//           },
//         ];
//         let status = await updateCartSession(
//           sessionID,
//           serializeData(cartDetails)
//         );
//         if (status) {
//           response["status"] = getStatusCode("success");
//           response["message"] = getMessage("cart_added_success", req.lang);
//           response["data"]["totalCartProducts"] = cartDetails.length;
//         }
//       } else {
//         let sessionCartDetails = await getUserSessionDetails(sessionID);
//         if (
//           sessionCartDetails &&
//           sessionCartDetails.length > 0 &&
//           !sessionCartDetails[0]["isMovedToUsers"]
//         ) {
//           let updatedSessionCartDetails = [];
//           if (sessionCartDetails[0]["cart"]) {
//             let deserializedCartDetails = deserializeData(
//               sessionCartDetails[0]["cart"]
//             );

//             let isProductAlreadyExists = false;
//             for (let i = 0; i < deserializedCartDetails.length; i++) {
//               const cartItem = deserializedCartDetails[i];

//               if (
//                 cartItem["dealId"] == producDetails["dealId"] &&
//                 cartItem["sizeId"] == producDetails["sizeId"]
//               ) {
//                 // // response["status"] = getStatusCode("failed");
//                 // // response["message"] = getMessage(
//                 // //   "product_already_exists_in_cart",
//                 // //   req.lang
//                 // );
//                 isProductAlreadyExists = true;
//                 deserializedCartDetails[i].quantity = cartItem["quantity"] + 1;

//                 // return res.send(response);
//               }
//             }

//             // if (true) {
//             //   response["status"] = getStatusCode("failed");
//             //   response["message"] = getMessage("product_already_exists_in_cart", req.lang);
//             //   return res.send(response);
//             // }

//             updatedSessionCartDetails = [...deserializedCartDetails];
//             if (!isProductAlreadyExists) {
//               updatedSessionCartDetails.push({
//                 item_id: getCurrentTimestamp(),
//                 dealId: Number(producDetails.dealId),
//                 sizeId: producDetails?.sizeId
//                   ? Number(producDetails?.sizeId)
//                   : 0,
//                 quantity: producDetails?.quantity
//                   ? Number(producDetails?.quantity)
//                   : 1,
//               });
//             }
//           } else {
//             updatedSessionCartDetails = [
//               {
//                 item_id: getCurrentTimestamp(),
//                 dealId: Number(producDetails.dealId),
//                 sizeId: producDetails?.sizeId
//                   ? Number(producDetails?.sizeId)
//                   : 0,
//                 quantity: producDetails?.quantity
//                   ? Number(producDetails?.quantity)
//                   : 1,
//               },
//             ];
//           }

//           let status = await updateCartSession(
//             sessionID,
//             serializeData(updatedSessionCartDetails)
//           );
//           if (status) {
//             response["status"] = getStatusCode("success");
//             response["message"] = getMessage("cart_added_success", req.lang);
//             response["data"]["totalCartProducts"] =
//               updatedSessionCartDetails.length;
//           } else {
//             response["status"] = getStatusCode("failed");
//             response["message"] = getMessage("try_again", req.lang);
//           }
//         } else {
//           response = {
//             status: getStatusCode("session_expired"),
//             message: getMessage("session_expired", req.lang),
//             data: {
//               totalCartProducts: 0,
//             },
//           };
//         }
//       }

//       return res.send(response);
//     }

//     let {
//       status,
//       totalCartProducts,
//       message = "",
//     } = await addToCart(producDetails, userDetails);
//     if (status === 1) {
//       response["status"] = getStatusCode("success");
//       response["message"] = getMessage("cart_added_success", req.lang);
//       response["data"] = { totalCartProducts: totalCartProducts };
//     } else if (status === -1) {
//       response["message"] = message;
//     } else {
//       response["data"] = { totalCartProducts: totalCartProducts };
//     }

//     res.send(response);
//   } catch (err) {
//     err;
//     logger.error(err);
//     next(err);
//   }
// };

exports.addToCart = async (req, res, next) => {
  try {
    let { userDetails } = req;
    let sessionID = req.userSessionID;
    let isNewSession = false;

    let producDetails = req.body.products || [
      {
        dealId: req.body.dealId,
        quantity: req.body.quantity,
        sizeId: req.body.sizeId,
      },
    ];

    let response = {
      status: getStatusCode("failed"),
      message: getMessage("try_again", req.lang),
      data: {
        totalCartProducts: 0,
      },
      sessionID: sessionID,
    };

    if (!sessionID && !isValidUserDetails(userDetails)) {
      sessionID = getUUID();
      let insertID = await createSessionUser(sessionID);
      if (!insertID) {
        response["status"] = getStatusCode("failed");
        response["message"] = getMessage("try_again", req.lang);
        return res.send(response);
      }
      isNewSession = true;
      response["sessionID"] = sessionID;
    }

    if (sessionID && !isValidUserDetails(userDetails)) {
      let status,
        totalCartProducts = 0;
      for (let product of producDetails) {
        let subProductDetails = await getProductDetailSession(
          Number(product.dealId),
          product?.sizeId ?? null
        );

        if (!subProductDetails || subProductDetails.length <= 0) {
          response["status"] = getStatusCode("failed");
          response["message"] = getMessage("product_not_found", req.lang);
          return res.send(response);
        } else if (
          subProductDetails &&
          subProductDetails.length > 0 &&
          subProductDetails[0]["quantity"] < (product?.quantity ?? 1)
        ) {
          response["status"] = getStatusCode("failed");
          response["message"] = getMessage(
            "product_quantity_is_not_enough"
          ).replace("##PRODUCT_NAME##", subProductDetails[0]["deal_title"]);
          return res.send(response);
        }

        if (isNewSession) {
          let cartDetails = [
            {
              item_id: getCurrentTimestamp(),
              dealId: Number(product.dealId),
              sizeId: product?.sizeId ? Number(product?.sizeId) : 0,
              quantity: product?.quantity ? Number(product?.quantity) : 1,
            },
          ];
          status = await updateCartSession(
            sessionID,
            serializeData(cartDetails)
          );
          if (status) {
            response["status"] = getStatusCode("success");
            response["message"] = getMessage("cart_added_success", req.lang);
            response["data"]["totalCartProducts"] = cartDetails.length;
          }
        } else {
          console.log("calling three of cart controller");

          let sessionCartDetails = await getUserSessionDetails(sessionID);
          console.log("calling three of cart controller");

          if (
            sessionCartDetails &&
            sessionCartDetails.length > 0 &&
            !sessionCartDetails[0]["isMovedToUsers"]
          ) {
            let updatedSessionCartDetails = [];
            if (sessionCartDetails[0]["cart"]) {
              let deserializedCartDetails = deserializeData(
                sessionCartDetails[0]["cart"]
              );

              let isProductAlreadyExists = false;
              for (let i = 0; i < deserializedCartDetails.length; i++) {
                const cartItem = deserializedCartDetails[i];

                if (
                  cartItem["dealId"] == product["dealId"] &&
                  cartItem["sizeId"] == product["sizeId"]
                ) {
                  isProductAlreadyExists = true;
                  deserializedCartDetails[i].quantity =
                    cartItem["quantity"] + 1;
                }
              }

              updatedSessionCartDetails = [...deserializedCartDetails];
              if (!isProductAlreadyExists) {
                updatedSessionCartDetails.push({
                  item_id: getCurrentTimestamp(),
                  dealId: Number(product.dealId),
                  sizeId: product?.sizeId ? Number(product?.sizeId) : 0,
                  quantity: product?.quantity ? Number(product?.quantity) : 1,
                });
              }
            } else {
              updatedSessionCartDetails = [
                {
                  item_id: getCurrentTimestamp(),
                  dealId: Number(product.dealId),
                  sizeId: product?.sizeId ? Number(product?.sizeId) : 0,
                  quantity: product?.quantity ? Number(product?.quantity) : 1,
                },
              ];
            }

            status = await updateCartSession(
              sessionID,
              serializeData(updatedSessionCartDetails)
            );
            if (status) {
              response["status"] = getStatusCode("success");
              response["message"] = getMessage("cart_added_success", req.lang);
              response["data"]["totalCartProducts"] =
                updatedSessionCartDetails.length;
            } else {
              response["status"] = getStatusCode("failed");
              response["message"] = getMessage("try_again", req.lang);
            }
          } else {
            response = {
              status: getStatusCode("session_expired"),
              message: getMessage("session_expired", req.lang),
              data: {
                totalCartProducts: 0,
              },
            };
          }
        }
      }

      return res.send(response);
    }

    let status = 0,
      totalCartProducts = 0,
      message = "";
    for (let product of producDetails) {
      let result = await addToCart(product, userDetails);
      if (result.status === 1) {
        status = 1;
        totalCartProducts = result.totalCartProducts;
      } else if (result.status === -1) {
        message = result.message;
      }
    }

    if (status === 1) {
      response["status"] = getStatusCode("success");
      response["message"] = getMessage("cart_added_success", req.lang);
      response["data"] = { totalCartProducts: totalCartProducts };
    } else if (status === -1) {
      response["message"] = message;
    } else {
      response["data"] = { totalCartProducts: totalCartProducts };
    }

    // let {
    //   status,
    //   totalCartProducts,
    //   message = "",
    // } = await addToCart(producDetails, userDetails);
    // if (status === 1) {
    //   response["status"] = getStatusCode("success");
    //   response["message"] = getMessage("cart_added_success", req.lang);
    //   response["data"] = { totalCartProducts: totalCartProducts };
    // } else if (status === -1) {
    //   response["message"] = message;
    // } else {
    //   response["data"] = { totalCartProducts: totalCartProducts };
    // }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
