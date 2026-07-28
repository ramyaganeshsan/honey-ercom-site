// import OwlCarousel from "react-owl-carousel";
import OwlCarousel from "react-owl-carousel-rtl";
import { getPageDirection } from "../../utils";

const Corousel = ({
  children,
  xs,
  sm,
  md,
  lg,
  xl,
  nav = false,
  margin = 0,
  loop = false,
  dots = false,
  autoplay = false,
}) => {
  return (
    <OwlCarousel
      responsive={{
        0: {
          items: xs,
        },
        320: {
          items: sm,
        },
        600: {
          items: md,
        },
        768: {
          items: lg,
        },
        1000: {
          items: xl,
        },
      }}
      margin={margin}
      nav={nav}
      loop={loop}
      dots={dots}
      autoplay={autoplay}
      // rtl={"true"}
      rtl={getPageDirection() === "rtl"}
      // rtlClass={"owl-rtl-slider"}
    >
      {children}
    </OwlCarousel>
  );
};

export default Corousel;
