import Corousel from "./carousel";

const Banner = ({ bannerImages }) => {
  return (
    <section className="banner">
      <div className="main_slider owl-theme">
        <Corousel
          xs={1}
          sm={1}
          md={1}
          lg={1}
          xl={1}
          loop={true}
          autoplay={true}
        >
          {bannerImages.map((image) => {
            if (image?.url) {
              return (
                <div key={image?.banner_id} className="item">
                  <img src={image.url} alt={image?.image_title} />
                </div>
              );
            }
            return null;
          })}
        </Corousel>
      </div>
    </section>
  );
};

export default Banner;
