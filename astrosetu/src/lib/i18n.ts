type Translations = {
  [key: string]: {
    en: string;
    hi: string;
  };
};

const translations: Translations = {
  "app.name": {
    en: "AstroSetu",
    hi: "अस्त्रोसेतु"
  },
  "app.tagline": {
    en: "Cosmic Guidance",
    hi: "ब्रह्मांडीय मार्गदर्शन"
  },
  "nav.kundli": {
    en: "Kundli",
    hi: "कुंडली"
  },
  "nav.match": {
    en: "Match",
    hi: "मिलान"
  },
  "nav.horoscope": {
    en: "Horoscope",
    hi: "राशिफल"
  },
  "nav.panchang": {
    en: "Panchang",
    hi: "पंचांग"
  },
  "nav.puja": {
    en: "Puja",
    hi: "पूजा"
  },
  "nav.community": {
    en: "Community",
    hi: "समुदाय"
  },
  "nav.learn": {
    en: "Learn",
    hi: "सीखें"
  }
};

export type Language = "en" | "hi";

let currentLanguage: Language = "en";

export const i18n = {
  setLanguage(lang: Language) {
    currentLanguage = lang;
    if (typeof window !== "undefined") {
      localStorage.setItem("astrosetu_lang", lang);
    }
  },
  getLanguage(): Language {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("astrosetu_lang") as Language;
      if (saved && ["en", "hi"].includes(saved)) {
        return saved;
      }
    }
    return currentLanguage;
  },
  t(key: string): string {
    const lang = this.getLanguage();
    return translations[key]?.[lang] || translations[key]?.en || key;
  }
};

