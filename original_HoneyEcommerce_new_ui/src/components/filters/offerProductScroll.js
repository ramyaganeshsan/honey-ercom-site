import InfiniteScroll from "react-infinite-scroll-component";
import OfferProductCard from "../utils/offerProductCard";
import { memo } from "react";

const OfferProductInfiniteScroll = ({ products, fetchMoreData, hasMore }) => {
  return (
    <InfiniteScroll
      dataLength={products?.length}
      next={fetchMoreData}
      hasMore={hasMore}
      className="infinite-scroll-container"
    >
      {products?.map((product) => {
        return (
          <div
            key={product.deal_id}
            className="col-12 col-sm-6 col-md-4 col-xl-3"
          >
            <OfferProductCard product={product} />
          </div>
        );
      })}
    </InfiniteScroll>
  );
};

export default memo(OfferProductInfiniteScroll);
