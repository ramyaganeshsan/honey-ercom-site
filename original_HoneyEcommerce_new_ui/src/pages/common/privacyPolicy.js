import { useLayoutEffect } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { changeActiveLink, getLanguage } from "../../utils";
import { t } from "i18next";
import { useGetPrivacyPolicyDetailsQuery } from "../../rtk/networkcalls/cms.query";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/utils/spinner";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/privacy_policy",
    text: t("privacy_policy"),
    isActive: true,
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetPrivacyPolicyDetailsQuery();
  console.log("cms priavay polity  : ", data);
  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  if (
    (isError && !isLoading) ||
    (data?.data?.status && Number(data?.data?.status) !== 1)
  ) {
    navigate("/");
  }

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
                <h2 className="page-title">
                  {getLanguage() === "en"
                    ? data?.data?.cms_title
                    : data?.data?.cms_title_french}
                </h2>
              </div>
              <div
                className="privacy_policy_page"
                dangerouslySetInnerHTML={{
                  __html:
                    getLanguage() === "en"
                      ? data?.data?.cms_desc
                      : data?.data?.cms_desc_french,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
