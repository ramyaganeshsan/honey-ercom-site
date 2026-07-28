import React from "react";
import { useEffect, useState } from "react";
import { t } from "i18next";
import Visa from "../../assets/paymentMethodIcons/visaTabby.png";
import MasterCard from "../../assets/paymentMethodIcons/masterCardTabby.png";
import ApplePay from "../../assets/paymentMethodIcons/ApplePayTabby.jpg";
import KentPay from "../../assets/paymentMethodIcons/kentTabby.png";

const Popup = ({ isVisible, onClose }) => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setPopupVisible(true);
    } else {
      const timer = setTimeout(() => setPopupVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isPopupVisible) return null;

  return (
    <div className={`popupoverlay ${isVisible ? "visible" : ""}`}>
      <div className="popcontent">
        <button className="popcloseButton" onClick={onClose}>
          X
        </button>
        <h3 className="popheading">{t("tabby")}</h3>
        <h3
          className="popmultiColor"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("shop_now")} <br />{" "}
          <span
            className="popmultiColor"
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("pay_split_tabby")}
          </span>
        </h3>
        <ul className="poplist">
          <li>— {t("tabby_list1")} </li>
          <li>— {t("tabby_list2")}</li>
          <li>— {t("tabby_list3")}</li>
        </ul>
        <h4 className="popsubHeader">{t("how_tabby_works")}</h4>
        <ol className="popsteps">
          <li className="popli">{t("step1")}</li>
          <li className="popli">{t("step2")}</li>
          <li className="popli">{t("step3")}</li>
          <li className="popli">{t("step4")}</li>
        </ol>
        <div className="popbuttonAndIcons">
          <button className="popcontinueButton" onClick={onClose}>
            {t("continue_shooping")}
          </button>
          <div className="poppaymentIcons">
            <img className="popicon" src={Visa} alt="Visa" />
            <img className="popicon" src={MasterCard} alt="MasterCard" />
            <img className="popicon" src={KentPay} alt="Kent" />
            <img
              style={{ height: "15px", marginTop: "5px" }}
              className="popicon"
              src={ApplePay}
              alt="ApplePay"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
