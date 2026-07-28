import { t } from "i18next";
import { Link } from "react-router-dom";

const getClassName = (activeLink, currentLink) => {
  if (activeLink === currentLink) {
    return "my_profile_link row active";
  }
  return "my_profile_link row";
};

const sidebarMenuLinks = [
  {
    id: "personal_info",
    name: t("personal_info"),
    to: "/personal_info",
  },
  {
    id: "wishlist",
    name: t("wishlist"),
    to: "/wishlist",
  },
  {
    id: "my_orders",
    name: t("orders"),
    to: "/my_orders",
  },
];

const ProfileSidebarMenu = ({ activeLink = "" }) => {
  return (
    <ul className="my_profile_links_container">
      {sidebarMenuLinks.map((link) => {
        return (
          <li key={link.id} className={getClassName(activeLink, link.id)}>
            <Link title={link.name} className="col-12" to={link.to}>
              {link.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ProfileSidebarMenu;
