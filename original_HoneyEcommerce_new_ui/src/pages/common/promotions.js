import { useEffect, useLayoutEffect, useState } from "react";
import { useGetOfferProductsQuery } from "../../rtk/networkcalls/product.query";
import Spinner from "../../components/utils/spinner";
import SomethingWentWrong from "../../components/utils/somethingWentWrong";
import NoDataFound from "../../components/utils/noDataFound";
import OfferProductInfiniteScroll from "../../components/filters/offerProductScroll";
import { t } from "i18next";
import { changeActiveLink } from "../../utils";

const OfferProducts = () => {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [noDataFound, setNoDataFound] = useState(false);

  const {
    data: productsResult,
    isLoading: productsLoading,
    refetch,
    isError: failedToFetchProducts,
  } = useGetOfferProductsQuery();

  useLayoutEffect(() => {
    /* Change active link after refresh */
    let pathName = new URL(window.location).pathname ?? "";
    changeActiveLink(pathName);
  }, []);

  useEffect(() => {
    if (
      productsResult &&
      Number(productsResult.status) === 1 &&
      productsResult.data.length > 0
    ) {
      setProducts(productsResult.data);

      if (productsResult.data.length < 20) {
        setHasMore(false);
      }
    } else if (
      productsResult &&
      Number(productsResult.status) === 1 &&
      productsResult.data.length === 0
    ) {
      setNoDataFound(true);
      setHasMore(false);
    }
  }, [productsResult]);

  if (productsLoading) {
    return <Spinner />;
  }

  if (failedToFetchProducts || Number(productsResult?.status) !== 1) {
    return <SomethingWentWrong />;
  }

  if (noDataFound) {
    return <NoDataFound />;
  }

  return (
    <div className="container">
      <div className="row">
        <h1
          className="offer-page-title"
          style={{
            color: "#383838",
            fontFamily: "Quicksand, sans-serif",
            fontSize: "24px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            margin: "20px 0px",
          }}
        >
          {t("offers")}
        </h1>
      </div>
      <div className="row">
        <OfferProductInfiniteScroll
          products={products}
          fetchMoreData={refetch}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};

export default OfferProducts;
