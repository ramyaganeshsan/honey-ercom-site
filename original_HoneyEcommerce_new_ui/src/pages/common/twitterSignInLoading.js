import { useLayoutEffect } from "react";
import { changeActiveLink } from "../../utils";
import { useGetTermsAndConditionDetailsQuery } from "../../rtk/networkcalls/cms.query";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/utils/spinner";
import SpinnerWithMessage from "../../components/utils/spinnerWithMessage";

const TwitterSignInLoading = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetTermsAndConditionDetailsQuery();

  useLayoutEffect(() => {
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  if (
    (isError && !isLoading) ||
    (data?.data?.status && Number(data?.data?.status) !== 1)
  ) {
    navigate("/");
  }

  return (
    <>
      <div className="contact-page-ctnr">
        <div className="container">
          <div className="contact-page-ctnr-inner">
            <div className="twitter-authentication row">
              <SpinnerWithMessage
                height="calc(100dvh - 300px)"
                message={"Please wait, We are processing your request."}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TwitterSignInLoading;
