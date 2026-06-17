import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      profile: "Profile",
      settings: "Settings",
      language: "Language",
      messages: "Messages"
    }
  },
  hi: {
    translation: {
      home: "होम",
      profile: "प्रोफ़ाइल",
      settings: "सेटिंग्स",
      language: "भाषा",
      messages: "मैसेज"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;