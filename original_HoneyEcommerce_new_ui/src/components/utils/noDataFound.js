import { t } from "i18next";
const NoDataFound = ({ resetAllFilters }) => {
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
                <h3>{t("no_data_found")}</h3>
                <p></p>
                <button
                  className="btn theme_btn"
                  onClick={() => resetAllFilters(true)}
                >
                  {t("clear_filter")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoDataFound;
