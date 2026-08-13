import { t } from "i18next";
import { Link } from "react-router-dom";
import { env } from "../../env";

const EmptyCart = () => {
  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                src="/images/no_data.png"
                alt="Error 500"
              />
              <div className="error-cont-blk">
                <h3>{t("empty_cart")}</h3>
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

export default EmptyCart;
