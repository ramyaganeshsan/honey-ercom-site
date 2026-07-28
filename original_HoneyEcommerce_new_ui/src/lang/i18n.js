import i18n from "i18next";
import { getLanguage } from "../utils";
import { initReactI18next } from "react-i18next";

import english from "./english";
import arabic from "./arabic";

const resources = {
  en: {
    translation: english,
  },
  ar: {
    translation: arabic,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage(),
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
