type Translations = {
  [key: string]: {
    en: string;
    hi: string;
    ta: string;
  };
};

const translations: Translations = {
  "app.name": {
    en: "AstroSetu",
    hi: "अस्त्रोसेतु",
    ta: "அஸ்ட்ரோசேது"
  },
  "app.tagline": {
    en: "Cosmic Guidance",
    hi: "ब्रह्मांडीय मार्गदर्शन",
    ta: "விண்வெளி வழிகாட்டுதல்"
  },
  "nav.kundli": {
    en: "Kundli",
    hi: "कुंडली",
    ta: "குண்டலி"
  },
  "nav.match": {
    en: "Match",
    hi: "मिलान",
    ta: "பொருத்தம்"
  },
  "nav.horoscope": {
    en: "Horoscope",
    hi: "राशिफल",
    ta: "இராசி"
  },
  "nav.panchang": {
    en: "Panchang",
    hi: "पंचांग",
    ta: "பஞ்சாங்கம்"
  },
  "nav.puja": {
    en: "Puja",
    hi: "पूजा",
    ta: "பூஜை"
  },
  "nav.community": {
    en: "Community",
    hi: "समुदाय",
    ta: "சமூகம்"
  },
  "nav.learn": {
    en: "Learn",
    hi: "सीखें",
    ta: "கற்றுக்கொள்ளுங்கள்"
  }
};

export type Language = "en" | "hi" | "ta";

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
      if (saved && ["en", "hi", "ta"].includes(saved)) {
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

