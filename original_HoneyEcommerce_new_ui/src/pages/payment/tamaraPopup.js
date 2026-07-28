import React from "react";
import { useEffect, useState } from "react";
import { t } from "i18next";

const PopupTamara = ({ isVisible, onClose }) => {
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
        <h3 className="popheading">{t("tamara")}</h3>
        <h3
          className="popmultiColor"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginTop: "30px",
          }}
        >
          {t("tamara_headline1")} <br />{" "}
          <h3
            className="popmultiColor"
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop: "10px",
            }}
          >
            {t("tamara_headline2")}
          </h3>
        </h3>
        <ul className="poplist" style={{ marginTop: "40px" }}>
          <li>— {t("tamara_list1")} </li>
          <li>— {t("tamara_list2")}</li>
          <li>— {t("tamara_list3")}</li>
        </ul>
        <h4 className="popsubHeader">{t("how_tabby_works")}</h4>
        <ol className="popsteps">
          <li className="popli">{t("tamara_step1")}</li>
          <li className="popli">{t("tamara_step2")}</li>
          <li className="popli">{t("tamara_step3")}</li>
        </ol>
        <div className="popbuttonAndIcons">
          <button className="popcontinueButton" onClick={onClose}>
            {t("continue_shooping")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupTamara;
