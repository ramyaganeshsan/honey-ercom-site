import React from "react";
import { currencyFormatter, getWordBasedOnLanguage } from "../../utils";
import { t } from "i18next";
import { Link } from "react-router-dom";

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

const ProductWishListCard = ({
  product,
  currencySymbol,
  addToCart,
  loadingAddToCart,
  removeFromWishlist,
  removingProductFromWishlist,
}) => {
  return (
    <>
      <div className="wishlist-products-container">
        <div className="wishlist-product-image-container">
          <img
            className="wishlist-product-image"
            alt={getWordBasedOnLanguage(
              product.deal_title,
              product?.deal_title_french
            )}
            src={product?.image}
          />
        </div>
        <div className="wishlist-product-details-container">
          <div>
            {getWordBasedOnLanguage(
              product.deal_title,
              product?.deal_title_french
            )}
          </div>
          <div className="tot-value">{`${currencySymbol} ${currencyFormatter(
            product.deal_value
          )}`}</div>
          <div className="wishlist-product-ratings">
            <span className="star">
              {getStars(product?.ratings)}
              {product?.total_reviews && product?.total_reviews > 0 ? (
                <>
                  &nbsp;&nbsp;
                  <span className="wishlist-product-total-reviews">
                    ( {product?.total_reviews} )
                  </span>
                </>
              ) : null}
            </span>
          </div>
          <div className="wishlist-action-container">
            {product?.having_size_color ? (
              <Link
                to={`/product_detail?q=${product?.deal_key}`}
                title={t("add_to_cart")}
                className="btn theme_btn"
              >
                {t("add_to_cart")}
              </Link>
            ) : (
              <button
                onClick={
                  !loadingAddToCart &&
                  !removingProductFromWishlist &&
                  product?.inStock
                    ? () => addToCart(product.deal_id)
                    : null
                }
                disabled={product?.inStock ? false : true}
                title={product?.inStock ? t("add_to_cart") : t("out_of_stock")}
                className={
                  product?.inStock > 0
                    ? "btn theme_btn"
                    : "btn theme_btn cyr-product-not-allowed"
                }
              >
                {t("add_to_cart")}
              </button>
            )}

            <button
              onClick={() => removeFromWishlist(product.deal_id)}
              className="btn theme_btn without_background"
            >
              {t("delete")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(ProductWishListCard);
