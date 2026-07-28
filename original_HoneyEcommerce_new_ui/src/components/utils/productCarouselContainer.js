const ProductCarouselContainer = ({ children, title, hide_title }) => {
  return (
    <div className="container">
      <div className="row">
        <div className="product_slider_container">
          {!hide_title && (
            <div className="product_title">
              <h2>{title}</h2>
            </div>
          )}
          <div id="product_carousel" className="product_carousel1 owl-theme">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCarouselContainer;
