const logger = require("../utils/logger");
const { getStatusCode, getMessage } = require("../utils");
const {
  getCartIds,
  getMyOrderDetails,
  cancelMyOrder,
  getInvoicedetails,
  getOrderDetails,
  getTrackIdByOrderID,
} = require("../services/orders.services");
const { sendOrderCancelEmail } = require("../services/notification.services");
const {
  LOGO_FOR_INVOICE,
  QR_CODE_FOR_INVOICE,
  SITENAME,
  STORE_ADDRESS,
  STORE_ADDRESS2,
  STORE_PHONE,
  STORE_EMAIL,
} = require("../utils/constants");
const website_url = process.env.WEBSITE_URL;
const { PDFDocument, rgb, StandardFonts, registerFontkit } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const fontkit = require("fontkit");
const bidiFactory = require("bidi-js");
const axios = require("axios");
const { Buffer } = require("buffer");

exports.getMyOrdersList = async (req, res, next) => {
  try {
    let { userDetails } = req;
    let response = {
      status: getStatusCode("success"),
      message: "",
      data: [],
    };

    let cartIds = await getCartIds(userDetails?.user_id);

    if (cartIds.length > 0) {
      let cartIdsString = "";
      cartIds.forEach((cart, index) => {
        if (index != cartIds.length - 1) {
          cartIdsString += `${cart.cart_id},`;
        } else {
          cartIdsString += `${cart.cart_id}`;
        }
      });

      let orderDetails = await getMyOrderDetails(cartIdsString);
      console.log("orderDetails : ", orderDetails);
      if (orderDetails && orderDetails?.length > 0) {
        /* Extracted orders and their products and splitted into object */
        let modifiedDetails = {};
        orderDetails.forEach((order) => {
          if (modifiedDetails[order.transaction_id]) {
            modifiedDetails[order.transaction_id]["products"].push(order);
          } else {
            modifiedDetails[order.transaction_id] = {
              products: [order],
            };
          }
        });

        /* Modified the response as per our need */
        let modifiedOrderDetails = [];
        let transactionIds = Object.keys(modifiedDetails);
        for (let i = 0; i < transactionIds.length; i++) {
          let details = {
            order_id: Number(transactionIds[i]),
            products: [],
          };
          let products = modifiedDetails[transactionIds[i]]["products"];
          if (products.length > 0) {
            details["cart_id"] = products[0]["cart_id"];
            details["DHL_shipmet_trackingID"] =
              products[0]["DHL_shipmet_trackingID"];
            details["total_price"] = products[0]["total_cart_price"];
            details["transaction_date"] = products[0]["transaction_date"];
            details["grand_total_price"] = products[0]["grand_total_price"];
            details["is_cancel"] = products[0]["is_cancel"];

            for (let j = 0; j < products.length; j++) {
              let productDetail = {
                deal_title: products[j]["deal_title"],
                deal_title_french: products[j]["deal_title_french"],
                deal_value: products[j]["deal_value"],
                deal_price: products[j]["deal_price"],
                dealID: products[j]["dealID"],
                quantity: products[j]["quantity"],
                sizeId: products[j]["sizeId"],

                sub_product_id: products[j]["sub_product_id"],
                delivery_status: products[j]["delivery_status"],
                admin_status: products[j]["admin_status"],
                item_id: products[j]["item_id"],
              };
              details.products.push(productDetail);
            }
          }
          modifiedOrderDetails.push(details);
        }

        /* Sort the orders */
        modifiedOrderDetails = modifiedOrderDetails.sort(
          (a, b) => b.order_id - a.order_id
        );

        response["data"] = modifiedOrderDetails;
      }
    }
    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.cancelMyOrder = async (req, res, next) => {
  try {
    let { cartId, orderId, cancellationReason } = req.body;
    let { userDetails } = req;
    let orderCancelled = await cancelMyOrder(
      cartId,
      orderId,
      cancellationReason,
      userDetails
    );
    let response = {
      status: getStatusCode("success"),
      message: getMessage("your_order_cancelled", req.lang),
      data: {},
    };
    if (!orderCancelled.status) {
      response = {
        ...response,
        status: getStatusCode("failed"),
        message:
          orderCancelled.message && orderCancelled.message != ""
            ? orderCancelled.message
            : getMessage("failed_to_cancel_order", req.lang),
      };
    } else {
      sendOrderCancelEmail(orderId, req.userDetails, req.lang);
    }

    res.send(response);
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};

exports.generateInvoicePdf = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const invoiceDetails = await getInvoicedetails(orderId);
    console.log("invoiceDetails : ", invoiceDetails);
    const pdfDoc = await PDFDocument.create();

    pdfDoc.registerFontkit(fontkit);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const sideMargin = 25;
    const topMargin = 20;

    const [logoImageResponse, qrCodeImageResponse] = await Promise.all([
      axios.get(LOGO_FOR_INVOICE, { responseType: "arraybuffer" }),
      axios.get(QR_CODE_FOR_INVOICE, { responseType: "arraybuffer" }),
    ]);

    const logoImageBuffer = Buffer.from(logoImageResponse.data, "binary");
    const qrCodeImageBuffer = Buffer.from(qrCodeImageResponse.data, "binary");

    const logoImage = await pdfDoc.embedPng(logoImageBuffer);
    const qrCodeImage = await pdfDoc.embedJpg(qrCodeImageBuffer);

    const imageWidth = 45;
    const imageHeight = 45;

    page.drawImage(qrCodeImage, {
      x: sideMargin,
      y: height - topMargin - imageHeight,
      width: imageWidth,
      height: imageHeight,
    });

    page.drawImage(logoImage, {
      x: width - sideMargin - imageWidth,
      y: height - topMargin - imageHeight,
      width: imageWidth,
      height: imageHeight,
    });

    const title = "Tax Invoice";
    const titleFontSize = 16;
    const titleFontColor = rgb(0.58, 0.35, 0.64);

    const amiriFontBytes = fs.readFileSync(
      path.join(__dirname, "ScheherazadeNew-Regular.ttf")
    );
    const amiriFont = await pdfDoc.embedFont(amiriFontBytes);

    const textWidth = amiriFont.widthOfTextAtSize(title, titleFontSize);
    const centerX = (width - textWidth) / 2;
    page.drawText(title, {
      x: centerX,
      y: height - topMargin - 60,
      size: titleFontSize,
      font: amiriFont,
      color: titleFontColor,
    });

    const shopAddress = `${SITENAME}\n${STORE_ADDRESS}, ${STORE_ADDRESS2}\nPhone: ${STORE_PHONE}\nEmail: ${STORE_EMAIL}`;
    const shippingAddress = `${invoiceDetails[0].shipping_name || ""}\n${
      invoiceDetails[0].cityName || ""
    }\n${invoiceDetails[0].stateName || ""}, ${
      invoiceDetails[0].countryName || ""
    }\nPhone: ${invoiceDetails[0].shipping_phone || ""}`;

    // Calculate the height needed for both addresses
    const shopAddressLines = shopAddress.split("\n").length;
    const shippingAddressLines = shippingAddress.split("\n").length;
    const maxAddressLines = Math.max(shopAddressLines, shippingAddressLines);
    const addressHeight = 15 + maxAddressLines * 12;

    let currentY = height - topMargin - 100; // Adjust starting position as necessary
    const addressFontColor = rgb(0.58, 0.35, 0.64);

    // Draw Shop Address
    page.setFont(amiriFont);
    page.drawText("Shop Address", {
      x: sideMargin,
      y: currentY,
      size: fontSize,
      color: addressFontColor,
    });

    page.setFont(amiriFont);
    page.setFontSize(12);
    page.drawText(shopAddress, {
      x: sideMargin,
      y: currentY - 15,
      maxWidth: width / 2 - 2 * sideMargin,
      lineHeight: 12,
    });

    // Draw Shipping Address
    page.setFont(amiriFont);
    page.drawText("Shipping Address", {
      x: width / 2 + sideMargin,
      y: currentY,
      size: fontSize,
      color: addressFontColor,
    });

    page.setFont(amiriFont);
    page.setFontSize(12);
    page.drawText(shippingAddress, {
      x: width / 2 + sideMargin,
      y: currentY - 15,
      maxWidth: width / 2 - 2 * sideMargin,
      lineHeight: 12,
    });

    // Adjust currentY to account for the address height
    currentY -= addressHeight + 20;

    page.drawLine({
      start: { x: sideMargin, y: currentY },
      end: { x: width - sideMargin, y: currentY },
      thickness: 1,
      color: rgb(0.58, 0.35, 0.64),
    });

    currentY -= 20;
    const transactionTimestamp = invoiceDetails[0].transaction_date;
    const transactionDate = new Date(transactionTimestamp * 1000);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = transactionDate
      .toLocaleDateString("en-GB", options)
      .replace(",", "-")
      .replace(" ", "-");

    const paymentDetails = `Order ID: ${orderId || ""}\nPayment Through: ${
      invoiceDetails[0].tracking_id || "(-)"
    }\nInvoice Date: ${formattedDate || ""}`;

    page.setFont(amiriFont);
    page.setFontSize(fontSize);
    page.drawText("Payment Details", {
      x: sideMargin,
      y: currentY,
      size: fontSize,
      color: addressFontColor,
    });

    page.setFont(amiriFont);
    page.setFontSize(12);
    page.drawText(paymentDetails, {
      x: sideMargin,
      y: currentY - 15,
      maxWidth: width - 2 * sideMargin,
      lineHeight: 12,
    });

    const paymentDetailsHeight = 15 + paymentDetails.split("\n").length * 12;
    currentY -= paymentDetailsHeight + 20;

    page.setFont(amiriFont);
    page.setFontSize(fontSize);
    page.drawText("ITEM DETAILS", {
      x: sideMargin,
      y: currentY,
      size: fontSize,
      color: addressFontColor,
    });

    const itemDetailsContentY = currentY - 10;
    page.setFont(amiriFont);
    page.setFontSize(12);
    page.drawText("Note: This shipment contains the following items", {
      x: sideMargin,
      y: itemDetailsContentY,
      size: fontSize,
      maxWidth: width - 2 * sideMargin,
      lineHeight: 12,
    });

    const tableHeaders = [
      "Title",
      "Quantity",
      "Unit Price",
      "Discounted Price",
      "Subtotal",
    ];

    const tableRows = invoiceDetails.map((item) => [
      `${item.deal_title} \n${item.size_name || ""}  \nItem Code : ${
        item.sku || ""
      }`,
      (item.quantity || "").toString(),
      `${item.currency_symbol || ""} ${
        item.deal_price + item.filling_price || ""
      } `,
      `${item.currency_symbol || ""} ${
        item.deal_value + item.filling_price || ""
      } `,
      `${item.currency_symbol || ""}${(
        item.quantity * item.deal_price || ""
      ).toString()} `,
    ]);

    const tableRowHeight = 73;
    const tableColWidths = [143, 100, 100, 100, 100];
    const tableTop = itemDetailsContentY - 90;
    const tableTextSize = 12;
    const cellPadding = 5; // Define padding inside each cell
    const verticalOffset = 50; // Define vertical offset to move content up
    let fontColor = rgb(0, 0, 0);

    const drawTable = (
      page,
      rows,
      headers,
      x,
      y,
      columnWidths,
      rowHeight,
      amiriFont,
      fontSize,
      drawHeaders = true
    ) => {
      let currentY = y;
      if (drawHeaders) {
        headers.forEach((header, colIndex) => {
          const xPos =
            x + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          page.drawRectangle({
            x: xPos,
            y: currentY,
            width: columnWidths[colIndex],
            height: rowHeight,
            color: rgb(0.58, 0.35, 0.64),
          });
          page.drawText(header, {
            x: xPos + cellPadding,
            y: currentY + cellPadding, // Adjust vertical position for header text
            size: fontSize,
            font: amiriFont,
            color: rgb(1, 1, 1),
          });
        });

        currentY -= rowHeight; // Move currentY up after drawing headers
      }
      // Draw table rows
      rows.forEach((row) => {
        let maxHeightInRow = 0;

        row.forEach((cell, colIndex) => {
          const xPos =
            x + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          const maxWidth = columnWidths[colIndex] - 2 * cellPadding;

          // const cellLines = cell.split("\n").length;
          // Calculate height required for current cell's content
          const cellLines = Math.ceil(
            amiriFont.widthOfTextAtSize(cell, fontSize) / maxWidth
          );
          const cellHeight = cellLines * fontSize + cellPadding * 2;

          // Draw cell content
          page.drawText(cell, {
            x: xPos + cellPadding,
            y: currentY + cellPadding + verticalOffset,
            size: fontSize,
            font: amiriFont,
            color: rgb(0, 0, 0),
            maxWidth: maxWidth,
            lineHeight: fontSize,
          });

          if (cellHeight > maxHeightInRow) {
            maxHeightInRow = cellHeight;
          }
        });

        currentY -= Math.max(maxHeightInRow, rowHeight) + cellPadding; // Include padding
      });

      // Draw table borders
      const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

      for (let i = 0; i <= rows.length; i++) {
        const yPos = y - i * (rowHeight + cellPadding); // Include padding in border calculation
        page.drawLine({
          start: { x, y: yPos },
          end: { x: x + totalWidth, y: yPos },
          thickness: 1.2,
          color: rgb(0.75, 0.75, 0.75),
        });
      }
      for (let i = 0; i <= headers.length; i++) {
        const xPos = x + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        page.drawLine({
          start: { x: xPos, y },
          end: { x: xPos, y: y - (rowHeight + cellPadding) * rows.length }, // Include padding in border calculation
          thickness: 1.2,
          color: rgb(0.75, 0.75, 0.75),
        });
      }

      return y - (rowHeight + cellPadding) * rows.length; // Include padding in final return value
    };
    //   return currentY;
    // };

    let page1TableRow = tableRows;
    if (tableRows.length > 5) {
      page1TableRow = tableRows.splice(0, 5);
    }

    let remainingSpace = drawTable(
      page,
      page1TableRow,
      tableHeaders,
      sideMargin,
      tableTop,
      tableColWidths,
      tableRowHeight,
      amiriFont,
      tableTextSize,
      rgb(0.58, 0.35, 0.64),
      true
    );

    // If there's not enough space on the current page, add a new one
    if (invoiceDetails.length > 5) {
      while (!tableRows.length <= 0) {
        page = pdfDoc.addPage();
        let height = 763.89;
        let margin = height - topMargin;
        remainingSpace = drawTable(
          page,
          tableRows.splice(0, 8),
          tableHeaders,
          sideMargin,
          margin,
          // height - topMargin,
          tableColWidths,
          tableRowHeight,
          amiriFont,
          tableTextSize,
          rgb(0.58, 0.35, 0.64),
          false
        );
        currentY = remainingSpace;
      }
    } else {
      currentY = remainingSpace;
    }

    page.setFont(amiriFont);
    page.setFontSize(12); // Summary Table

    const summaryTableHeaders = [
      "Shipment Value",
      "Tax",
      "Shipping",
      "Amount to be paid",
    ];
    let totalResult = 0;

    invoiceDetails.forEach((invoice) => {
      const itemQuantity = invoice.item_quantity;
      const dealValue = invoice.deal_value;
      const result = itemQuantity * dealValue;

      totalResult += result;

      const amountToPaid =
        Number(totalResult) +
        Number(invoiceDetails[0].delivery_charge) +
        Number(invoiceDetails[0].tax_amount);

      const summaryTableRows = [
        [
          `${invoiceDetails[0].currency_symbol || ""} ${totalResult} `,
          `${invoiceDetails[0].currency_symbol} ${
            invoiceDetails[0].tax_amount || ""
          }`,
          `${invoiceDetails[0].currency_symbol} ${
            invoiceDetails[0].delivery_charge || ""
          }`,
          `${invoiceDetails[0].currency_symbol} ${amountToPaid}`,
        ],
      ];

      const summaryTableRowHeight = 20;
      const summaryTableColWidth = 100; // Adjust column width as needed
      const summaryTableLeftMarginAdjustment = 3;
      const summaryTableTop = currentY - 16;
      const summaryTableSpacing = -2;

      // Draw table
      summaryTableHeaders.forEach((header, rowIndex) => {
        const y = summaryTableTop - rowIndex * summaryTableRowHeight;

        // Common x position for both header and value columns
        const headerX =
          width -
          sideMargin -
          summaryTableColWidth * 2 -
          summaryTableLeftMarginAdjustment -
          summaryTableSpacing;
        const valueX = headerX + summaryTableColWidth + summaryTableSpacing;

        let headerBackgroundColor = rgb(1, 1, 1);
        if (header === "Amount to be paid") {
          headerBackgroundColor = rgb(0.58, 0.35, 0.64); // Adjust to your desired color
        }

        // Draw header rectangle
        page.drawRectangle({
          x: headerX,
          y: y - 5,
          width: summaryTableColWidth,
          height: summaryTableRowHeight,
          color: headerBackgroundColor,
        });
        const amountToBePaid = summaryTableHeaders[3];
        // Draw header text
        page.drawText(header, {
          x: headerX + 5, // Adjust for padding
          y: y,
          size: fontSize,
          font: amiriFont,
          color: header === amountToBePaid ? rgb(1, 1, 1) : rgb(0, 0, 0),
        });

        // Draw top border line for header
        page.drawLine({
          start: { x: headerX, y: y - 5 },
          end: { x: headerX + summaryTableColWidth, y: y - 5 },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw bottom border line for header
        page.drawLine({
          start: { x: headerX, y: y + summaryTableRowHeight - 5 },
          end: {
            x: headerX + summaryTableColWidth,
            y: y + summaryTableRowHeight - 5,
          },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw left border line for header
        page.drawLine({
          start: { x: headerX, y: y - 5 },
          end: { x: headerX, y: y + summaryTableRowHeight - 5 },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw right border line for header
        page.drawLine({
          start: { x: headerX + summaryTableColWidth, y: y - 5 },
          end: {
            x: headerX + summaryTableColWidth,
            y: y + summaryTableRowHeight - 5,
          },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw value rectangle
        page.drawRectangle({
          x: valueX,
          y: y - 5,
          width: summaryTableColWidth,
          height: summaryTableRowHeight,
          color: headerBackgroundColor,
        });

        // Draw value text
        page.drawText(summaryTableRows[0][rowIndex], {
          x: valueX + 5, // Adjust for padding
          y: y,
          size: fontSize,
          amiriFont,
          color: header === amountToBePaid ? rgb(1, 1, 1) : rgb(0, 0, 0),
        });

        // Draw top border line for value
        page.drawLine({
          start: { x: valueX, y: y - 5 },
          end: { x: valueX + summaryTableColWidth, y: y - 5 },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw bottom border line for value
        page.drawLine({
          start: { x: valueX, y: y + summaryTableRowHeight - 5 },
          end: {
            x: valueX + summaryTableColWidth,
            y: y + summaryTableRowHeight - 5,
          },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw left border line for value
        page.drawLine({
          start: { x: valueX, y: y - 5 },
          end: { x: valueX, y: y + summaryTableRowHeight - 5 },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });

        // Draw right border line for value
        page.drawLine({
          start: { x: valueX + summaryTableColWidth, y: y - 5 },
          end: {
            x: valueX + summaryTableColWidth,
            y: y + summaryTableRowHeight - 5,
          },
          thickness: 1,
          color: rgb(0.75, 0.75, 0.75),
        });
      });

      const footerY = summaryTableTop - 120;

      const footerText = `If you have any questions, feel free to call customer care at +971 555540017 or visit our website ${website_url} Delivery within two working days.`;

      page.setFontSize(fontSize);
      page.setFont(amiriFont);

      const footerTextWidth = amiriFont.widthOfTextAtSize(footerText, fontSize);
      const footerTextLines = Math.ceil(
        footerTextWidth / (width - 2 * sideMargin)
      );
      const footerTextHeight = footerTextLines * 12;

      page.drawText(footerText, {
        x: sideMargin,
        y: footerY - footerTextHeight,
        maxWidth: width - 2 * sideMargin,
        lineHeight: 12,
      });

      const commentsY = footerY + 20;
      page.setFont(amiriFont);
      page.setFontSize(fontSize);
      page.drawText("Customer Comments:", {
        x: sideMargin,
        y: commentsY,
        size: fontSize,
      });

      page.setFont(amiriFont);
      page.setFontSize(12);
      page.drawText(invoiceDetails.remarks || "", {
        x: sideMargin,
        y: commentsY - 15,
        maxWidth: width - 2 * sideMargin,
        lineHeight: 12,
      });
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Length", pdfBytes.length);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    let orderId = req.body.orderId;
    let orderDetails = await getOrderDetails(orderId);

    res.send({
      status: getStatusCode("success"),
      message: "",
      data: orderDetails,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    next(err);
  }
};
