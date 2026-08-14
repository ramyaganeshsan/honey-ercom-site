import React from "react";
import Header from "./header";
import Footer from "./footer";
import { Outlet } from "react-router-dom";
import { siteSettingsContext } from "../../contexts";
import SignIn from "../../forms/signin";
import SignUp from "../../forms/signup";
import { useLocation } from "react-router-dom";
import useUserInfo from "../../hooks/useUserInfo";

const ApplicationLayout = () => {
  const userInfo = useUserInfo();
  const siteCongifurationDetails = React.useContext(siteSettingsContext);
  const isLoggedIn = Boolean(userInfo?.user_id || userInfo?.token);

  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(-200, -200);
  }, [pathname]);

  return (
    <>
      <Header
        contact_email={siteCongifurationDetails?.siteSettings?.contact_email}
        phone1={siteCongifurationDetails?.siteSettings?.phone1}
        site_name={siteCongifurationDetails?.siteSettings?.site_name}
        wishListCount={
          siteCongifurationDetails?.userCartDetails?.wishListCount ?? 0
        }
        cartCount={siteCongifurationDetails?.userCartDetails?.cartCount ?? 0}
        userInfo={userInfo}
        categories={siteCongifurationDetails?.categories ?? []}
      />
      <main>
        <Outlet />
      </main>
      <Footer
        userInfo={userInfo}
        footer_logo={siteCongifurationDetails?.siteSettings?.footer_logo}
        contact_email={siteCongifurationDetails?.siteSettings?.contact_email}
        shopTitle1={siteCongifurationDetails?.siteSettings?.shopTitle1}
        shopTiming1={siteCongifurationDetails?.siteSettings?.shopTiming1}
        shopTitle2={siteCongifurationDetails?.siteSettings?.shopTitle2}
        shopTiming2={siteCongifurationDetails?.siteSettings?.shopTiming2}
        phone1={siteCongifurationDetails?.siteSettings?.phone1}
        googleMapUrl={siteCongifurationDetails?.siteSettings?.googleMapUrl}
        copy_right={siteCongifurationDetails?.siteSettings?.copy_right}
        address1={siteCongifurationDetails?.siteSettings?.address1}
        address2={siteCongifurationDetails?.siteSettings?.address2}
        zipcode={siteCongifurationDetails?.siteSettings?.zipcode}
        facebook_page={siteCongifurationDetails?.siteSettings?.facebook_page}
        instagram_page={siteCongifurationDetails?.siteSettings?.instagram_page}
        twitter_page={siteCongifurationDetails?.siteSettings?.twitter_page}
        youtube_url={siteCongifurationDetails?.siteSettings?.youtube_url}
        pinterest={siteCongifurationDetails?.siteSettings?.pinterest}
      />
      {!isLoggedIn && (
        <>
          <SignIn
            loginImage={
              siteCongifurationDetails?.siteSettings?.login_page_image
            }
          />
          <SignUp
            signupImage={
              siteCongifurationDetails?.siteSettings?.signin_page_image
            }
          />
        </>
      )}
    </>
  );
};

export default React.memo(ApplicationLayout);
