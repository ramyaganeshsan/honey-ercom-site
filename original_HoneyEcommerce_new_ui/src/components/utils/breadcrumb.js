import { Link } from "react-router-dom";

const BreadCrumb = ({ links }) => {
  return (
    <div className="page-options-lft">
      <ul className="breadcrumb-blk">
        {links.map((link) => {
          if (link?.isActive) {
            return (
              <li key={link.id} className="breadcrumb-list">
                <span title={link.text} className="breadcrumb-list-item active">
                  {link.text}
                </span>
              </li>
            );
          }
          return (
            <li key={link.id} className="breadcrumb-list">
              <Link
                to={link.path}
                title={link.text}
                className="breadcrumb-list-item"
              >
                {link.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BreadCrumb;
