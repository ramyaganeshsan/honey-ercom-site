import { t } from "i18next";
import { Link } from "react-router-dom";

const Footer = ({
  footer_logo,
  contact_email,
  shopTitle1,
  shopTiming1,
  shopTitle2,
  shopTiming2,
  phone1,
  googleMapUrl,
  copy_right,
  address1,
  address2,
  zipcode,
  facebook_page,
  instagram_page,
  twitter_page,
  youtube_url,
  pinterest,
  userInfo,
}) => {
  return (
    <footer>
      <div className="ftr-main">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-4 mb-4 mb-md-0">
              <div className="ftr-blocks ftr-blk1">
                <div className="ftr-logo">
                  {/* <img src={footer_logo} alt={t("footer_logo_alt_text")} /> */}
                  {/* <img src="Our Logo" alt={t("footer_logo_alt_text")} /> */}
                  <p>Our Logo</p>
                </div>
                <p>
                  {address1}
                  <br />
                  {address2}
                  <br />
                  {t("zipcode")} : {zipcode}
                </p>
                <p className="map-ico">
                  <Link
                    className="custom_link_color"
                    target="_blank"
                    to={googleMapUrl}
                  >
                    {t("location_on_map")}
                  </Link>
                </p>
                <ul className="soc-icons">
                  <li>
                    <Link
                      to={facebook_page}
                      title={t("facebook")}
                      target="_blank"
                      className="fb-ico"
                    ></Link>
                  </li>
                  <li>
                    <Link
                      to={twitter_page}
                      title={t("twitter")}
                      target="_blank"
                      className="tw-ico"
                    ></Link>
                  </li>
                  <li>
                    <Link
                      to={youtube_url}
                      title={t("youtube")}
                      target="_blank"
                      className="yt-ico"
                    ></Link>
                  </li>
                  <li>
                    <Link
                      to={pinterest}
                      title={t("pinterest")}
                      target="_blank"
                      className="pn-ico"
                    ></Link>
                  </li>
                  <li>
                    <Link
                      to={instagram_page}
                      title={t("instagram")}
                      target="_blank"
                      className="insta-ico"
                    ></Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-8">
              <div className="row">
                <div className="col-12 col-sm-12 col-md-4">
                  <div className="ftr-blocks ftr-blocks mt-xs-5 mt-lg-0">
                    <h3 className="ftr-title">{t("office_info")}</h3>
                    <ul className="ftr-links">
                      <li>
                        <Link
                          to={`mailto:${contact_email}`}
                          className="mail_ico"
                          title={contact_email}
                        >
                          {contact_email}
                        </Link>
                      </li>
                      <li>
                        {/* <p>
                          {shopTitle1}
                          <br />
                          {shopTiming1}
                          <br />
                          {shopTitle2}
                          <br />
                          {shopTiming2}
                        </p> */}
                      </li>
                      <li>
                        <Link
                          to={`tel:${phone1}`}
                          className="phone_ico phone_number_alignment"
                          title={phone1}
                        >
                          {phone1}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-4">
                  <div className="ftr-blocks ftr-blocks mt-xs-5 mt-xl-0">
                    <h3 className="ftr-title">{t("get_help")}</h3>
                    <ul className="ftr-links">
                      <li>
                        <Link to="/faqs" title={t("faqs")}>
                          {t("faqs")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/terms_and_condition"
                          title={t("terms_of_use")}
                        >
                          {t("terms_of_use")}
                        </Link>
                      </li>
                      <li>
                        <Link to="/contact_us" title={t("contact_us")}>
                          {t("contact_us")}
                        </Link>
                      </li>
                      <li>
                        <Link to="/about_us" title={t("about_us")}>
                          {t("about_us")}
                        </Link>
                      </li>
                      <li>
                        <Link to="/contact_us" title={t("business_with_us")}>
                          {t("business_with_us")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-4">
                  <div className="ftr-blocks ftr-blocks mt-xs-5 mt-xl-0">
                    <h3 className="ftr-title">{t("shop_links")}</h3>
                    <ul className="ftr-links">
                      {userInfo && Object.keys(userInfo).length > 0 && (
                        <>
                          <li>
                            <Link to="/wishlist" title={t("my_wishlist")}>
                              {t("my_wishlist")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/cart" title={t("my_cart")}>
                              {t("my_cart")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/cart" title={t("checkout")}>
                              {t("checkout")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/my_orders" title={t("track_my_order")}>
                              {t("track_my_order")}
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <Link to="/privacy_policy" title={t("privacy_policy")}>
                          {t("privacy_policy")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ftr-btm">
        <div className="container">
          <div className="row">
            <div className="col col-md-12">
              <div className="ftr-btm-inner">
                <span className="copyright-txt">{copy_right}</span>
                <span className="icon-cards"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
