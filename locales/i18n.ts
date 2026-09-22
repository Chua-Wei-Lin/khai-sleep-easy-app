import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import zh from "./zh.json";

i18n.use(initReactI18next).init({
  lng: "en", // default language
  fallbackLng: "en", // fallback language
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false, // Prevents issues with AsyncStorage loading
  },
});

export default i18n;
