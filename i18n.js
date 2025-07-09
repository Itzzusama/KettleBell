import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import I18NextHttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem("userLanguage");
      if (!savedLanguage) {
        callback("en"); // default language
      } else {
        callback(savedLanguage);
      }
    } catch (error) {
      console.error("Error reading language from AsyncStorage:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem("userLanguage", language);
    } catch (error) {
      console.error("Error saving language to AsyncStorage:", error);
    }
  },
};

i18next
  .use(I18NextHttpBackend) // Optional if you're loading translations remotely
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false, // react already protects from XSS
    },
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
  });

export default i18next;
