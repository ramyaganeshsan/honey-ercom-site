import React, { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { t } from "i18next";
import { env } from "../../env";

const Error404 = () => {
  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
    if (window) {
      window?.scrollTo(-200, -200);
    }
  }, []);

  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                src={`${env.ASSETS_URL}/images/img-404.svg`}
                alt="Error 404"
              />
              <div className="error-cont-blk">
                <h3>{t("page_not_found")}</h3>
                <p>{t("page_not_found_message")}</p>
                <Link to="/" className="btn theme_btn">
                  {t("back_to_home")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
