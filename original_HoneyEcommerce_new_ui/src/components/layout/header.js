import React, { Fragment, useEffect, useState } from "react";
import { t } from "i18next";
import { Link, useNavigate } from "react-router-dom";
import TopHeader from "./topHeader";
import {
  encrypteQueryData,
  getWordBasedOnLanguage,
  productFilters,
} from "../../utils";
import $ from "jquery";

const Header = ({
  contact_email,
  phone1,
  site_name,
  wishListCount,
  cartCount,
  userInfo,
  categories,
}) => {
  let pathName = new URL(window.location).pathname ?? "";
  let navigate = useNavigate();

  const getInitialSubCategories = (cats) => {
    const firstLevel =
      Array.isArray(cats) && cats.length > 0 ? cats[0]?.category : [];
    return Array.isArray(firstLevel) ? firstLevel : [];
  };

  const [initialsubCategory, setInitialSubCategory] = useState(() =>
    getInitialSubCategories(categories)
  );
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    setInitialSubCategory(getInitialSubCategories(categories));
  }, [categories]);

  const handleCategoryChange = (nextCategories) => {
    setInitialSubCategory(Array.isArray(nextCategories) ? nextCategories : []);
  };
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth <= 768);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    $(".categories").click(function () {
      $(".cyr-mega-menu-ctnr").addClass("active");
      $("body").addClass("menu-open");
      $(".cyr-search-bar").hide();
    });

    $("#cyr-all-cate").click((e) => {
      e.stopPropagation();
      $(".cyr-mega-menu-ctnr").addClass("active");
      $("body").addClass("menu-open");
      $(".cyr-search-bar").hide();
    });

    $(".close-menu").click(() => {
      $(".cyr-mega-menu-ctnr").removeClass("active");
      $("body").removeClass("menu-open");
    });

    $(".category_link").click(() => {
      $(".cyr-mega-menu-ctnr").removeClass("active");
      $("body").removeClass("menu-open");
    });
    window.addEventListener("click", function (e) {
      for (const select of document.querySelectorAll(".categories")) {
        if (!select.contains(e.target)) {
          for (const select1 of document.querySelectorAll(
            ".cyr-mega-menu-ctnr"
          )) {
            if (!select1.contains(e.target)) {
              $(".cyr-mega-menu-ctnr").removeClass("active");
              $("body").removeClass("menu-open");
              // $(".cyr-search-bar").show();
            }
          }
        }
      }
      for (const select of document.querySelectorAll(".show-filter")) {
        if (!select.contains(e.target)) {
          for (const select1 of document.querySelectorAll(
            ".product-list-lft"
          )) {
            if (!select1.contains(e.target)) {
              $(".product-list-lft").removeClass("active");
            }
          }
        }
      }
    });

    $(".cyr-mega-menu-ctnr").click(() => {
      $(".cyr-mega-menu-ctnr").removeClass("active");
    });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearchBox = (event) => {
    let productName = document.getElementById("search").value;
    if (event.key === "Enter" && productName && productName.length > 0) {
      let link = `/products?q=${encrypteQueryData(
        JSON.stringify({
          ...productFilters,
          name: encodeURIComponent(productName),
        })
      )}`;
      document.getElementById("search").value = "";
      navigate(link);
    }
  };

  return (
    <>
      <header className="layout_header">
        <TopHeader
          email={contact_email ?? ""}
          phone={phone1 ?? ""}
          isLoggedIn={
            userInfo && Object.keys(userInfo).length > 0 ? true : false
          }
        />
        <div className="cyr-main-header">
          <div className="container">
            <nav className="navbar navbar-expand-lg">
              <p className="navbar-brand"></p>
              <div className="menu-bar-blk" style={{ position: "relative" }}>
                <span id="cyr-all-cate" className="cyr-all-cate">
                  &nbsp;
                </span>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div
                  className="collapse navbar-collapse"
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav">
                    <li className="nav-item home_page">
                      {pathName === "/" || pathName === "home" ? (
                        <span
                          className="nav-link nav_link_top_bar"
                          id="home_link"
                          title={t("home")}
                        >
                          {t("home")}
                        </span>
                      ) : (
                        <Link
                          className="nav-link nav_link_top_bar"
                          id="home_link"
                          title={t("home")}
                          to="/"
                        >
                          {t("home")}
                        </Link>
                      )}
                    </li>
                    <li
                      className="nav-item category_menu"
                      style={{ position: "relative" }}
                    >
                      <span
                        className="nav-link nav_link_top_bar categories pointer_cursor"
                        title={t("categories")}
                        to="#"
                      >
                        {t("categories")}
                      </span>
                      <div className="cyr-mega-menu-ctnr">
                        <div className="mobile-logo-blk">
                          <Link className="navbar-brand" to="/">
                            Our Logo
                          </Link>
                          <button
                            className="btn-close close-menu"
                            type="button"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="mega-menu-lft">
                          <ul>
                            {categories?.map((mainCategory) => {
                              return (
                                <li key={mainCategory.category_id}>
                                  <Link
                                    className="category_link"
                                    onMouseOver={() =>
                                      handleCategoryChange(
                                        mainCategory?.category
                                      )
                                    }
                                    id={encrypteQueryData(
                                      JSON.stringify({
                                        // ...productFilters,
                                        m_c: mainCategory.category_id,
                                      })
                                    )}
                                    to={`/products?q=${encrypteQueryData(
                                      JSON.stringify({
                                        // ...productFilters,
                                        m_c: mainCategory.category_id,
                                      })
                                    )}`}
                                    // title={mainCategory?.category_name}
                                    title={getWordBasedOnLanguage(
                                      mainCategory?.category_name,
                                      mainCategory?.category_name_french
                                    )}
                                  >
                                    {/* {mainCategory?.category_name} */}
                                    {getWordBasedOnLanguage(
                                      mainCategory?.category_name,
                                      mainCategory?.category_name_french
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div className="mega-menu-rgt">
                          <div className="mega-menu-rgt-blks">
                            {initialsubCategory?.map((subCategory) => {
                              return (
                                <Fragment key={subCategory.category_id}>
                                  <h3>
                                    <Link
                                      className="category_link"
                                      id={encrypteQueryData(
                                        JSON.stringify({
                                          // ...productFilters,
                                          m_c: subCategory.main_category_id,
                                          s_c: subCategory?.category_id,
                                        })
                                      )}
                                      to={`/products?q=${encrypteQueryData(
                                        JSON.stringify({
                                          // ...productFilters,
                                          m_c: subCategory.main_category_id,
                                          s_c: subCategory?.category_id,
                                        })
                                      )}`}
                                      title={getWordBasedOnLanguage(
                                        subCategory.category_name,
                                        subCategory.category_name_french
                                      )}
                                    >
                                      {/* {subCategory.category_name} */}
                                      {getWordBasedOnLanguage(
                                        subCategory.category_name,
                                        subCategory.category_name_french
                                      )}
                                    </Link>
                                  </h3>
                                  <ul>
                                    {subCategory?.category?.map(
                                      (secondLevelCategory) => {
                                        return (
                                          <li
                                            key={
                                              secondLevelCategory.category_id
                                            }
                                          >
                                            <Link
                                              className="category_link"
                                              id={encrypteQueryData(
                                                JSON.stringify({
                                                  // ...productFilters,
                                                  m_c: subCategory.main_category_id,
                                                  s_c: subCategory?.category_id,
                                                  sl_c: secondLevelCategory.category_id,
                                                })
                                              )}
                                              to={`/products?q=${encrypteQueryData(
                                                JSON.stringify({
                                                  // ...productFilters,
                                                  m_c: subCategory.main_category_id,
                                                  s_c: subCategory?.category_id,
                                                  sl_c: secondLevelCategory.category_id,
                                                })
                                              )}`}
                                              // title={secondLevelCategory?.category_name}
                                              title={getWordBasedOnLanguage(
                                                secondLevelCategory.category_name,
                                                secondLevelCategory.category_name_french
                                              )}
                                            >
                                              {/* {secondLevelCategory?.category_name} */}
                                              {getWordBasedOnLanguage(
                                                secondLevelCategory.category_name,
                                                secondLevelCategory.category_name_french
                                              )}
                                            </Link>
                                          </li>
                                        );
                                      }
                                    )}
                                  </ul>
                                </Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </li>
                    {/* <li className="nav-item">
                    <Link
                      className="nav-link nav_link_top_bar"
                      to="/new_arrivals"
                      id="new_arrivals_link"
                      title={t("new_arrival")}
                    >
                      {t("new_arrival")}
                    </Link>
                  </li> */}
                    <li className="nav-item product_page">
                      {pathName === "/products" ||
                      pathName === "product_detail" ? (
                        <span
                          className="nav-link nav_link_top_bar"
                          id="products_link"
                          title={t("products")}
                        >
                          {t("products")}
                        </span>
                      ) : (
                        <Link
                          className="nav-link nav_link_top_bar"
                          to={`/products?q=${encrypteQueryData(
                            JSON.stringify({ ...productFilters })
                          )}`}
                          id="products_link"
                          title={t("products")}
                        >
                          {t("products")}
                        </Link>
                      )}
                    </li>
                    <li className="nav-item product_page">
                      {pathName === "/promotions" ? (
                        <span
                          className="nav-link nav_link_top_bar"
                          id="promotions_link"
                          title={t("promotions")}
                        >
                          {t("promotions")}
                        </span>
                      ) : (
                        <Link
                          className="nav-link nav_link_top_bar"
                          to="/promotions"
                          id="promotions_link"
                          title={t("promotions")}
                        >
                          {t("promotions")}
                        </Link>
                      )}
                    </li>
                    <li className="nav-item about_us_page">
                      {pathName === "/about_us" ? (
                        <span
                          className="nav-link nav_link_top_bar"
                          id="about_us_link"
                          title={t("about_us")}
                        >
                          {t("about_us")}
                        </span>
                      ) : (
                        <Link
                          className="nav-link nav_link_top_bar"
                          to="/about_us"
                          id="about_us_link"
                          title={t("about_us")}
                        >
                          {t("about_us")}
                        </Link>
                      )}
                    </li>
                    <li className="nav-item contact_us_page">
                      {pathName === "contact_us" ? (
                        <span
                          className="nav-link nav_link_top_bar"
                          id="contact_us_link"
                          title={t("contact_us")}
                        >
                          {t("contact_us")}
                        </span>
                      ) : (
                        <Link
                          className="nav-link nav_link_top_bar"
                          to="/contact_us"
                          id="contact_us_link"
                          title={t("contact_us")}
                        >
                          {t("contact_us")}
                        </Link>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              <ul className="navbar-right">
                {userInfo && Object.keys(userInfo).length > 0 && (
                  <li>
                    <Link
                      className="icon-profile"
                      title={t("my_account")}
                      to="/personal_info"
                    >
                      {t("profile_info")}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/wishlist"
                    className="icon-wishlist"
                    title={t("my_wishlist")}
                  >
                    {t("wishlist")}
                    <span id="wishlistCount">{wishListCount ?? 0}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="icon-cart" title={t("cart")}>
                    {t("cart")}
                    <span id="cartCount">{cartCount ?? 0}</span>
                  </Link>
                </li>
              </ul>
            </nav>
            <div id="cyr-search-bar" className="cyr-search-bar">
              <input
                type="text"
                id="search"
                name="search"
                onKeyDown={handleSearchBox}
                onPaste={handleSearchBox}
                placeholder={t("search_products")}
              />
            </div>

            {isSmallScreen && (
              <div className="cyr-mega-menu-ctnr">
                <div className="mobile-logo-blk">
                  <Link className="navbar-brand" to="/">
                    Our Logo
                  </Link>
                  <button
                    className="btn-close close-menu"
                    type="button"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="mega-menu-lft">
                  <ul>
                    {categories?.map((mainCategory) => {
                      return (
                        <li key={mainCategory.category_id}>
                          <Link
                            className="category_link"
                            onMouseOver={() =>
                              handleCategoryChange(mainCategory?.category)
                            }
                            id={encrypteQueryData(
                              JSON.stringify({
                                // ...productFilters,
                                m_c: mainCategory.category_id,
                              })
                            )}
                            to={`/products?q=${encrypteQueryData(
                              JSON.stringify({
                                // ...productFilters,
                                m_c: mainCategory.category_id,
                              })
                            )}`}
                            // title={mainCategory?.category_name}
                            title={getWordBasedOnLanguage(
                              mainCategory?.category_name,
                              mainCategory?.category_name_french
                            )}
                          >
                            {/* {mainCategory?.category_name} */}
                            {getWordBasedOnLanguage(
                              mainCategory?.category_name,
                              mainCategory?.category_name_french
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mega-menu-rgt">
                  <div className="mega-menu-rgt-blks">
                    {initialsubCategory?.map((subCategory) => {
                      return (
                        <Fragment key={subCategory.category_id}>
                          <h3>
                            <Link
                              className="category_link"
                              id={encrypteQueryData(
                                JSON.stringify({
                                  // ...productFilters,
                                  m_c: subCategory.main_category_id,
                                  s_c: subCategory?.category_id,
                                })
                              )}
                              to={`/products?q=${encrypteQueryData(
                                JSON.stringify({
                                  // ...productFilters,
                                  m_c: subCategory.main_category_id,
                                  s_c: subCategory?.category_id,
                                })
                              )}`}
                              title={getWordBasedOnLanguage(
                                subCategory.category_name,
                                subCategory.category_name_french
                              )}
                            >
                              {/* {subCategory.category_name} */}
                              {getWordBasedOnLanguage(
                                subCategory.category_name,
                                subCategory.category_name_french
                              )}
                            </Link>
                          </h3>
                          <ul>
                            {subCategory?.category?.map(
                              (secondLevelCategory) => {
                                return (
                                  <li key={secondLevelCategory.category_id}>
                                    <Link
                                      className="category_link"
                                      id={encrypteQueryData(
                                        JSON.stringify({
                                          // ...productFilters,
                                          m_c: subCategory.main_category_id,
                                          s_c: subCategory?.category_id,
                                          sl_c: secondLevelCategory.category_id,
                                        })
                                      )}
                                      to={`/products?q=${encrypteQueryData(
                                        JSON.stringify({
                                          // ...productFilters,
                                          m_c: subCategory.main_category_id,
                                          s_c: subCategory?.category_id,
                                          sl_c: secondLevelCategory.category_id,
                                        })
                                      )}`}
                                      // title={secondLevelCategory?.category_name}
                                      title={getWordBasedOnLanguage(
                                        secondLevelCategory.category_name,
                                        secondLevelCategory.category_name_french
                                      )}
                                    >
                                      {/* {secondLevelCategory?.category_name} */}
                                      {getWordBasedOnLanguage(
                                        secondLevelCategory.category_name,
                                        secondLevelCategory.category_name_french
                                      )}
                                    </Link>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
