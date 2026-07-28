import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  changeActiveLink,
  convertJSONToQueryString,
  decrypteQueryData,
  encrypteQueryData,
  removeSessionID,
} from "../../utils";
import {
  useSearchParams,
  useNavigate,
  createSearchParams,
} from "react-router-dom";
import { t } from "i18next";
import BreadCrumb from "../../components/utils/breadcrumb";
import {
  useGetProductFiltersQuery,
  useGetProductsQuery,
} from "../../rtk/networkcalls/product.query";
import Spinner from "../../components/utils/spinner";
import { siteSettingsContext } from "../../contexts";
import $ from "jquery";
import ProductInfiniteScroll from "../../components/filters/productInfiniteScroll";
import FilterByRatings from "../../components/filters/filterByRatings";
import PriceFilter from "../../components/filters/priceFilter";
import SomethingWentWrong from "../../components/utils/somethingWentWrong";
import CatwgoryWithProductCount from "../../components/filters/categoryWithProductCount";
import NoDataFound from "../../components/utils/noDataFound";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/",
    text: t("products"),
    isActive: true,
  },
];

const Products = () => {
  const siteInfo = useContext(siteSettingsContext);

  const previousFiltersString = useRef("");
  const previousQueryString = useRef("");

  const [ratingsFilter, setRatingsFilter] = useState([]);
  const [products, setProducts] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [maximumPrice, setMaximumPrice] = useState("");

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    max: "",
    name: "",
    rate_review: "",
    m_c: "",
    s_c: "",
    sl_c: "",
    pageSize: 20,
    // pageNumber: "",
    sort_by: "",
    refetch_data: true,
  });

  const pageNumber = useRef(1);
  const [searchParams] = useSearchParams();
  const navigator = useNavigate();

  const {
    data,
    isLoading,
    isError: failedToFetchFilters,
  } = useGetProductFiltersQuery();
  const {
    data: productsResult,
    isLoading: productsLoading,
    refetch,
    // isFetching,
    // isSuccess,
    isError: failedToFetchProducts,
  } = useGetProductsQuery(
    searchParams.get("q")
      ? convertJSONToQueryString({
          ...filters,
          pageNumber: pageNumber.current ? Number(pageNumber.current) : 1,
          ...decrypteQueryData(searchParams.get("q")),
        })
      : ""
  );

  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);
  }, []);

  useEffect(() => {
    $(".category_link").on("click", function (event) {
      $(".cyr-mega-menu-ctnr").removeClass("active");
      $("body").removeClass("menu-open");

      if (previousQueryString.current !== event.target.id) {
        previousQueryString.current = event.target.id;
        pageNumber.current = 1;
        resetAllFilters();
      }
    });

    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
    let q = searchParams.get("q");
    let decryptedFilters = decrypteQueryData(q);
    setFilters((prev) => ({
      ...prev,
      max: decryptedFilters["max"] ?? "",
      name: decryptedFilters["name"] ?? "",
      rate_review: decryptedFilters["rate_review"] ?? "",
      m_c: decryptedFilters["m_c"] ?? "",
      s_c: decryptedFilters["s_c"] ?? "",
      sl_c: decryptedFilters["sl_c"] ?? "",
      pageSize: decryptedFilters["pageSize"] ?? 20,
      sort_by: decryptedFilters["sort_by"] ?? "",
      refetch_data: true,
    }));
    if (
      decryptedFilters["rate_review"] &&
      decryptedFilters["rate_review"] !== ""
    ) {
      let rate_review = decryptedFilters["rate_review"];
      if (typeof rate_review === "string") {
        rate_review = rate_review.split(",");
        rate_review = rate_review.map((rating) => Number(rating));
        setRatingsFilter(rate_review);
      }
    }
    if (
      decryptedFilters?.max &&
      decryptedFilters["max"] !== "" &&
      !isNaN(decryptedFilters["max"])
    ) {
      setMaximumPrice(decryptedFilters["max"]);
    }

    return () => {
      $(".category_link").unbind("click");
    };
  }, []);

  useEffect(() => {
    let queryString = JSON.stringify(filters);
    if (
      filters?.refetch_data &&
      previousFiltersString.current !== queryString
    ) {
      previousFiltersString.current = queryString;
      navigator(
        {
          pathname: "/products",
          search: createSearchParams({
            q: encrypteQueryData(JSON.stringify(filters)),
          }).toString(),
        },
        { replace: true }
      );
      setProducts([]);
      pageNumber.current = 1;
      setHasMore(true);
      setNoDataFound(false);
      // refetch();
    }
  }, [filters]);

  useEffect(() => {
    if (
      productsResult &&
      Number(productsResult.status) === 1 &&
      productsResult?.data?.length > 0
    ) {
      let updatedProducts = [...products];
      updatedProducts.push(...productsResult?.data);
      setProducts(updatedProducts);

      if (productsResult?.data?.length < filters?.pageSize) {
        setHasMore(false);
      }
    } else if (
      productsResult &&
      Number(productsResult?.status) === 1 &&
      productsResult?.data?.length <= 0
    ) {
      if (products?.length <= 0) {
        setNoDataFound(true);
      }
      setHasMore(false);
    }
  }, [productsResult]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 1) {
      setFilters((prev) => ({
        ...prev,
        m_c: "",
        refetch_data: true,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        m_c: Number(categoryId),
        refetch_data: true,
      }));
    }
  };

  const handleSortBy = (value) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: value,
      refetch_data: true,
    }));
  };

  const handlePageSize = (value) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: value,
      refetch_data: true,
    }));
  };

  const handleFilterChange = () => {
    setFilters((prev) => ({
      ...prev,
      max: maximumPrice,
      rate_review: ratingsFilter?.join(","),
      refetch_data: true,
    }));
  };

  const handlePriceChange = (value) => {
    if (!isNaN(value) && Number(value) > 0) {
      setMaximumPrice(Number(value));
    }
  };

  const handleFilterCheckbox = (value) => {
    let ratings = [...ratingsFilter];
    if (!isNaN(value) && Number(value) >= 1 && Number(value) <= 5) {
      if (!ratings?.includes(Number(value))) {
        ratings.push(Number(value));
      } else {
        let index = ratings.indexOf(Number(value));
        if (index !== -1) {
          ratings.splice(index, 1);
        }
      }
    }
    setRatingsFilter(ratings);
  };

  const fetchMoreData = () => {
    if (hasMore && !productsLoading) {
      pageNumber.current += 1;
      refetch();
    }
  };

  const resetAllFilters = (refetch_data = false) => {
    setProducts([]);
    setHasMore(true);
    setNoDataFound(false);
    setMaximumPrice("");
    setRatingsFilter([]);
    setFilters({
      max: "",
      name: "",
      rate_review: "",
      m_c: "",
      s_c: "",
      sl_c: "",
      pageSize: 20,
      sort_by: "",
      refetch_data: refetch_data,
    });
    previousFiltersString.current = JSON.stringify({
      max: "",
      name: "",
      rate_review: "",
      m_c: "",
      s_c: "",
      sl_c: "",
      pageSize: 20,
      sort_by: "",
      refetch_data: refetch_data,
    });
    navigator(
      {
        pathname: "/products",
        replace: true,
        search: createSearchParams({
          q: encrypteQueryData(
            JSON.stringify({
              max: "",
              name: "",
              rate_review: "",
              m_c: "",
              s_c: "",
              sl_c: "",
              pageSize: 20,
              sort_by: "",
            })
          ),
        }).toString(),
      },
      { replace: true }
    );
  };

  const clearFilters = () => {
    let queryString = JSON.stringify({
      max: "",
      name: "",
      rate_review: "",
      m_c: "",
      s_c: "",
      sl_c: "",
      pageSize: 20,
      sort_by: "",
    });
    let currentQueryString = "";
    try {
      currentQueryString = JSON.parse(previousFiltersString.current ?? "");
      delete currentQueryString["refetch_data"];
      currentQueryString = JSON.stringify(currentQueryString);
    } catch (err) {
      currentQueryString = {};
    }
    if (currentQueryString !== queryString) {
      if (window) {
        window?.scrollTo(-200, -200);
      }
      pageNumber.current = 0;
      resetAllFilters();
    }
  };

  const handleResponsiveCategory = (e) => {
    e.stopPropagation();
    $(".product-list-lft").toggleClass("active");
  };

  if (isLoading || productsLoading) {
    return <Spinner />;
  }

  if (
    failedToFetchFilters ||
    failedToFetchProducts ||
    (Number(data?.status) !== 1 && !isLoading) ||
    (Number(productsResult?.status) !== 1 && !productsLoading)
  ) {
    return <SomethingWentWrong />;
  }

  if (noDataFound) {
    return <NoDataFound resetAllFilters={resetAllFilters} />;
  }

  return (
    <>
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
              <div className="page-options-rgt">
                <div className="show-filter-blk">
                  <span
                    onClick={handleResponsiveCategory}
                    id="show-filter"
                    className="show-filter d-lg-none pointer_cursor"
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    title="Filter"
                  >
                    {t("filter")}
                  </span>
                </div>
                <div className="sort-blk">
                  <select
                    // defaultValue={""}
                    onChange={(e) => handleSortBy(e?.target?.value)}
                    value={filters.sort_by}
                    className="form-select"
                    aria-label="Default select example"
                  >
                    <option value={""}>{t("sort_by")}</option>
                    {data?.data?.sortFilter?.map((filter) => {
                      return (
                        <option value={filter.value} key={filter.key}>
                          {t(filter.key)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="sort-count-blk">
                  <label htmlFor="">{t("show")}: </label>
                  <select
                    // defaultValue={20}
                    value={filters?.pageSize}
                    onChange={(e) => handlePageSize(e.target.value)}
                    className="form-select"
                    aria-label="Default select example"
                  >
                    {data?.data?.itemsPerPage?.map((record) => {
                      return (
                        <option value={record} key={record}>
                          {`${record} ${t("items")}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="product-listpage-ctnr">
        <div className="container">
          <div className="row">
            <div className="product-listpage-ctnr-inner">
              <div className="product-list-lft">
                <button
                  type="button"
                  id="filter_close"
                  onClick={handleResponsiveCategory}
                  className="btn-close d-lg-none"
                  aria-label="Close"
                ></button>
                <CatwgoryWithProductCount
                  categories={data?.data?.categoryWiseProductCount ?? []}
                  handleCategoryChange={handleCategoryChange}
                />
                <PriceFilter
                  data={data?.data ?? {}}
                  maximumPrice={maximumPrice}
                  handlePriceChange={handlePriceChange}
                  siteInfo={siteInfo}
                />
                <FilterByRatings
                  handleFilterCheckbox={handleFilterCheckbox}
                  ratingsFilter={ratingsFilter}
                />
                <button
                  onClick={handleFilterChange}
                  type="button"
                  disabled={productsLoading}
                  className="btn theme_btn"
                >
                  {t("filter")}
                </button>
                <button
                  onClick={clearFilters}
                  type="button"
                  className="btn link"
                >
                  {t("clear_filter")}
                </button>
              </div>
              <div className="product-list-rgt">
                <div className="container">
                  <div className="row">
                    <h2 className="page-title">{t("products")}</h2>
                  </div>
                </div>
                <div className="container">
                  {noDataFound ? (
                    <NoDataFound />
                  ) : (
                    <div className="row">
                      <ProductInfiniteScroll
                        products={products}
                        fetchMoreData={fetchMoreData}
                        hasMore={hasMore}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
