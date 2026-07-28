import { t } from "i18next";
import { currencyFormatter, getWordBasedOnLanguage } from "../../utils";
import { memo } from "react";

const ProductCartList = ({
  product,
  currencySymbol,
  handleQuantityChange,
  handleProductRemove,
  loading,
  // handleOnFocusOut,
}) => {
  return (
    <div className="cart-tb-tr">
      <div className="cart-tb-td cart-td-prod">
        <div className="prod-det-sm">
          <img
            src={product.image}
            alt={getWordBasedOnLanguage(
              product.deal_title,
              product?.deal_title_french
            )}
          />
          <div className="prod-det-sm-cont">
            <h6 className="prod-name">
              {`${getWordBasedOnLanguage(
                product.deal_title,
                product?.deal_title_french
              )} ${product.size_name ? "( " + product.size_name + " )" : ""}`}
            </h6>
            <p className="product-code">
              {t("product_code")}: {product.sku}
            </p>
          </div>
        </div>
      </div>
      <div className="cart-tb-td cart-td-price">
        <span>
          {currencySymbol} {currencyFormatter(product.currentPrice)}
        </span>
      </div>
      {/* <div  className="cart-tb-td cart-td-qty">
        <input
          type="text"
          name="item-quantity"
          disabled={!product?.inStock}
          onChange={(e) =>
            product?.inStock
              ? handleQuantityChange(e.target.value, product.item_id)
              : null
          }
          onBlur={(e) =>
            product?.inStock
              ? handleOnFocusOut(e.target.value, product.item_id)
              : null
          }
          value={product.item_quantity}
        />
      </div> */}
      <div className="qty_value">
        <b
          onClick={() => handleQuantityChange("decrement", product.item_id)}
          className="qtyup fa fa-minus"
          title={t("reduce")}
        ></b>
        <span>{product.item_quantity}</span>
        <b
          onClick={() => handleQuantityChange("increment", product.item_id)}
          className="qtydown fa fa-plus"
          title={t("increase")}
        ></b>
      </div>
      <div className="cart-tb-td cart-td-total">
        {currencySymbol} {currencyFormatter(product.totalPrice)}
      </div>
      <div className="cart-tb-td cart-td-act">
        <button
          disabled={loading}
          onClick={() =>
            !loading
              ? handleProductRemove(product?.sub_product_id, product?.item_id)
              : null
          }
          className="remove-cart-item"
          title={t("remove")}
        ></button>
      </div>
    </div>
  );
};

export default memo(ProductCartList);
