import { Fragment, useContext, useEffect, useLayoutEffect } from "react";
import Banner from "../components/utils/banner";
import { siteSettingsContext } from "../contexts";
import { t } from "i18next";
import { Link } from "react-router-dom";
import Corousel from "../components/utils/carousel";
import { changeActiveLink } from "../utils";
import ProductCard from "../components/utils/productCard";
import ProductCarouselContainer from "../components/utils/productCarouselContainer";
import $ from "jquery";

const Home = () => {
  let homePage = useContext(siteSettingsContext);

  useLayoutEffect(() => {
    /* Change active link after refresh or initalLoad */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);
  }, []);

  useEffect(() => {
    $(window).scroll(function () {
      if ($(window).scrollTop() >= 40) {
        $("header").addClass("fixed_header");
        $(".cyr-search-bar").css("display", "none");
      } else {
        $("header").removeClass("fixed_header");
        $(".cyr-search-bar").css("display", "flex");
      }
    });
    return () => {
      $(window).unbind("scroll");
    };
  }, []);

  /* 
    const siteFeatures = useMemo(
      () => [
        {
          id: 1,
          title: t("naturally_delivered_title"),
          className: "cyr-naturally-derived",
          description: t("naturally_delivered_description"),
        },
        {
          id: 3,
          title: t("offers"),
          isTitle: true,
        },
        {
          id: 2,
          title: t("secure_payments_title"),
          className: "cyr-secure-payment",
          description: t("secure_payments_description"),
        },
      ],
      []
    );
  */

  return (
    <>
      <Banner bannerImages={homePage?.bannerImages} />
      {/* <section className="cyr-widget-conatiner site-features">
        <div className="container">
          <div className="cyr-widget-conatiner-inner">
            <ul>
              {siteFeatures.map((details) => {
                if (!details?.isTitle) {
                  return (
                    <li key={details?.id}>
                      <i className={details?.className}></i>
                      <div className="cyr-widget-cont">
                        <p>{details?.title}</p>
                        <span>{details?.description}</span>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={details?.id} className="offer-blk">
                    <div className="product_title">
                      <h2>{details.title}</h2>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section> */}
      <section className="cyr-product-section">
        {homePage?.offerProducts && homePage?.offerProducts.length > 0 && (
          <div className="product_section_inner product_slider_block1">
            <ProductCarouselContainer title={t("offers")}>
              <Corousel
                nav={true}
                margin={10}
                xs={1}
                sm={1}
                md={2}
                lg={3}
                xl={4}
              >
                {homePage?.offerProducts?.map((product) => {
                  return (
                    <Fragment key={product?.deal_id}>
                      <ProductCard product={product} />
                    </Fragment>
                  );
                })}
              </Corousel>
            </ProductCarouselContainer>
          </div>
        )}

        {homePage?.newProducts && homePage?.newProducts.length > 0 && (
          <div className="product_section_inner product_slider_block2">
            <ProductCarouselContainer title={t("new_arrival_home")}>
              <Corousel
                nav={true}
                margin={10}
                xs={1}
                sm={1}
                md={2}
                lg={3}
                xl={4}
              >
                {homePage?.newProducts?.map((product) => {
                  return (
                    <Fragment key={product?.deal_id}>
                      <ProductCard product={product} />
                    </Fragment>
                  );
                })}
              </Corousel>
            </ProductCarouselContainer>
          </div>
        )}
        {homePage?.bestSellingProducts &&
          homePage?.bestSellingProducts.length > 0 && (
            <div className="product_section_inner product_slider_block3">
              <ProductCarouselContainer title={t("best_seller")}>
                <Corousel
                  nav={true}
                  margin={10}
                  xs={1}
                  sm={1}
                  md={2}
                  lg={3}
                  xl={4}
                >
                  {homePage?.bestSellingProducts?.map((product) => {
                    return (
                      <Fragment key={product?.deal_id}>
                        <ProductCard product={product} />
                      </Fragment>
                    );
                  })}
                </Corousel>
              </ProductCarouselContainer>
            </div>
          )}
      </section>
      <section className="cyr-poster">
        <img
          src={homePage?.siteSettings?.offer_poster}
          alt={t("offer_poster")}
        />
        <div className="cyr-poster-blk">
          <div className="container">
            <div className="row">
              <div className="cyr-poster-inner">
                <div className="cyr-poster-cont-blk">
                  <h3 className="cyr-poster-title">
                    {t("best_seller_header")}
                  </h3>
                  <p>{t("best_seller_text")}</p>
                  <small>{homePage?.siteSettings?.offer_text}</small>
                  <Link
                    to="/products"
                    className="theme_btn"
                    title={t("shop_now")}
                  >
                    {t("shop_now")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
