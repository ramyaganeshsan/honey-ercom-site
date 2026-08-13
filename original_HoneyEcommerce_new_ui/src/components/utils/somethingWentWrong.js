import { t } from "i18next";

const SomethingWentWrong = () => {
  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                src="/images/img-500.png"
                alt="Error 500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/no_image_available.png";
                }}
              />
              <div className="error-cont-blk">
                <h3>{t("something_went_wrong")}</h3>
                <p>{t("something_went_wrong_details")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SomethingWentWrong;
