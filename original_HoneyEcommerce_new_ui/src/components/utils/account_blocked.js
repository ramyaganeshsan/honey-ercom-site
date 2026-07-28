import { t } from "i18next";
import { Link } from "react-router-dom";

const AccountBlocked = ({ handleLogout }) => {
  return (
    <div className="error-page-ctnr">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="error-page-blk">
              <img
                style={{ width: "400px" }}
                src={`${process.env.REACT_APP_ASSETS_URL}/images/account-blocked.jpeg`}
                alt="blocked image"
              />
              <div className="error-cont-blk">
                <h3>{t("account_blocked_heading")}</h3>
                <p>
                  {t(`account_blocked`)} <br></br>
                  <Link to="/contact_us">{t("contact_us")}</Link>
                </p>
                <button
                  className="btn theme_btn"
                  onClick={() => handleLogout(true)}
                >
                  {t("signout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBlocked;
