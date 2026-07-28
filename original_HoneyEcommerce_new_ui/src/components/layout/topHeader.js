import React from "react";
import { Link } from "react-router-dom";
import { t } from "i18next";
import { getLanguage, setLanguage } from "../../utils";

const TopHeader = ({ isLoggedIn, email, phone }) => {
  const handleLanguageChange = (e) => {
    let currentLanguage = getLanguage();
    let language = e.target.value;

    if (language !== currentLanguage) {
      setLanguage(language);
      window.location.reload();
    }
  };

  return (
    <>
      <div className="cyr-top-hd">
        <div className="container">
          <div className="cyr-top-hd-blk">
            <ul className="cyr-top-hd-lft">
              <li>
                <Link title={email} to={`mailto:${email}`}>
                  {email}
                </Link>
              </li>
              <li>
                <Link
                  className="phone_number_alignment"
                  title={phone}
                  to={`tel:${phone}`}
                >
                  {phone}
                </Link>
              </li>
            </ul>
            <ul className="cyr-top-hd-rgt">
              <li>
                <select value={getLanguage()} onChange={handleLanguageChange}>
                  <option title={t("english")} value="en">
                    {t("english")}
                  </option>
                  <option title={t("arabic")} value="ar">
                    {t("arabic")}
                  </option>
                </select>
                {/* <span className="pointer_cursor" href="#" title="English">
                  English
                </span>
                <ul className="top-herader-language-container">
                  <li>
                    <span className="top-header-language">Arabic</span>
                  </li>
                  <li>
                    <span className="top-header-language">French</span>
                  </li>
                  <li>
                    <span className="top-header-language">Malayalam</span>
                  </li>
                </ul> */}
              </li>
              <li>
                <Link to="/terms_and_condition" title={t("terms_of_use")}>
                  {t("terms_of_use")}
                </Link>
              </li>
              {!isLoggedIn ? (
                <>
                  <li>
                    <Link
                      to="#"
                      className="cyr-pointer-cursor"
                      title={t("signin")}
                      id="signinButton"
                      data-bs-toggle="modal"
                      data-bs-target="#signinModal"
                    >
                      {t("signin")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="cyr-pointer-cursor"
                      title={t("signup")}
                      data-bs-toggle="modal"
                      data-bs-target="#signupModal"
                    >
                      {t("signup")}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/my_orders" title={t("track_my_order")}>
                      {t("track_my_order")}
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/my_account" title={t("my_account")}>
                      {t("my_account")}
                    </Link>
                  </li> */}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopHeader;
