import { t } from "i18next";
import { Link } from "react-router-dom";

const EmptyWishlist = () => {
  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                src={`${process.env.REACT_APP_ASSETS_URL}/images/no_data.png`}
                alt="Error 500"
              />
              <div className="error-cont-blk">
                <h3>{t("empty_wishlist")}</h3>
                <p></p>
                <Link to="/products" className="btn theme_btn">
                  {t("go_to_products")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyWishlist;
