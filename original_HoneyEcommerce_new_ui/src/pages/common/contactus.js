import { useLayoutEffect, useContext } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import ContactUsForm from "../../forms/contactus";
import { changeActiveLink } from "../../utils";
import { t } from "i18next";
import { siteSettingsContext } from "../../contexts";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/contact_us",
    text: t("contact_us"),
    isActive: true,
  },
];

const Contactus = () => {
  const siteInfo = useContext(siteSettingsContext);
  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  return (
    <>
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="contact-page-ctnr">
        <div className="container">
          <div className="contact-page-ctnr-inner">
            <div className="row">
              <div className="col-12">
                <h2 className="page-title">{t("contact_us")}</h2>
              </div>
              <ContactUsForm />
              <div className="col-sm-12 col-md-12 col-lg-6">
                <div className="contact-info-ctnr">
                  <h3>{t("contact_info")}</h3>
                  <p className="map-ico">
                    {`${siteInfo?.siteSettings?.address1} 
                        ${siteInfo?.siteSettings?.address2}`}{" "}
                  </p>
                  <p className="phone_ico phone_number_alignment align_right">
                    {siteInfo?.siteSettings?.phone1}
                  </p>
                  <p className="mail_ico">
                    {siteInfo?.siteSettings?.contact_email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contactus;
