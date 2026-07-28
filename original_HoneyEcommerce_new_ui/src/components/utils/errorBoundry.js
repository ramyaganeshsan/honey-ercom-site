import React from "react";
import { t } from "i18next";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidMount() {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }

  static getDerivedStateFromError(error) {
    console.log(error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page-ctnr">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="error-page-blk">
                  <img
                    src={`${
                      process.env.REACT_APP_ASSETS_URL || ""
                    }/images/img-500.png`}
                    alt="Error 500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/img-500.png";
                    }}
                  />
                  <div className="error-cont-blk">
                    <h3>{t("something_went_wrong")}</h3>
                    <p>{t("technical_issue")}</p>
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
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
