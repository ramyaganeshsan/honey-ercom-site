import Corousel from "./carousel";
import { resolveAssetUrl, handleAssetImageError } from "../../utils";

const Banner = ({ bannerImages }) => {
  const images = Array.isArray(bannerImages) ? bannerImages : [];

  if (images.length === 0) {
    return null;
  }

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
          {images.map((image) => {
            if (image?.url) {
              return (
                <div key={image?.banner_id} className="item">
                  <img
                    src={resolveAssetUrl(
                      image.url,
                      "/images/no_image_available.png"
                    )}
                    alt={image?.image_title || "Banner"}
                    onError={(e) =>
                      handleAssetImageError(e, "/images/no_image_available.png")
                    }
                  />
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
