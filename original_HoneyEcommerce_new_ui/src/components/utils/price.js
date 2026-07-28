import React from "react";

const Price = ({
  originalPrice = 0,
  discountPrice = 0,
  currentSymbol,
  fromProductDetatails = false,
}) => {
  if (fromProductDetatails) {
    if (
      Number(discountPrice) !== 0 &&
      Number(discountPrice) !== Number(originalPrice)
    ) {
      return (
        <div className="price_block">
          <span className="price">{`${currentSymbol} ${discountPrice}`}</span>
          <strike>{`${currentSymbol} ${originalPrice}`}</strike>
        </div>
      );
    }

    return (
      <div className="price_block">
        <span className="price">{`${currentSymbol} ${discountPrice}`}</span>
      </div>
    );
  }

  if (
    Number(discountPrice) !== 0 &&
    Number(discountPrice) !== Number(originalPrice)
  ) {
    return (
      <div className="prod_price_blk">
        <strike>{`${currentSymbol} ${originalPrice}`}</strike>
        &nbsp;
        <span className="price">{`${currentSymbol} ${discountPrice}`}</span>
      </div>
    );
  }

  return (
    <div className="prod_price_blk">
      <span className="price">{`${currentSymbol} ${discountPrice}`}</span>
    </div>
  );
};

export default React.memo(Price);
