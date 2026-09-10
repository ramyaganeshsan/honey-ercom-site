import { Link } from "react-router-dom";
import { t } from "i18next";

/**
 * GOZO HOME brand mark + wordmark for header / mobile menus.
 */
const BrandLogo = ({ to = "/", className = "navbar-brand" }) => {
  return (
    <Link className={className} to={to} title={t("logo_alt")}>
      <img
        className="gozo-brand-mark"
        src="/images/gozo/brand-mark-white.png"
        alt=""
        width={44}
        height={72}
      />
      <span className="gozo-brand-text">
        <span className="gozo-brand-name">GOZO</span>
        <span className="gozo-brand-home">HOME</span>
      </span>
    </Link>
  );
};

export default BrandLogo;
