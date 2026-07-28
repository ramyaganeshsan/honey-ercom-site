import { t } from "i18next";

const SomethingWentWrong = () => {
  const assetsUrl = process.env.REACT_APP_ASSETS_URL;
  const imageSrc = assetsUrl
    ? `${assetsUrl}/images/img-500.png`
    : "/images/img-500.png";

  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                src={imageSrc}
                alt="Error 500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/img-500.png";
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
