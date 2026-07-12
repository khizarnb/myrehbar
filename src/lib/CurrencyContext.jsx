import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

// Regional currencies with custom exact tiers for base product price (P = 50 or 55)
// and fallback multiplier rates for arbitrary prices
export const CURRENCIES = {
  CAD: {
    code: "CAD",
    symbol: "CA$",
    label: "CA$ CAD",
    rate: 1.1,      // Base 50 -> 55 CAD
    fixedBase: 55,  // Exact tier when product price == 50 or 55
  },
  USD: {
    code: "USD",
    symbol: "$",
    label: "$ USD",
    rate: 0.8,      // Base 50 -> 40 USD
    fixedBase: 40,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "£ GBP",
    rate: 0.6,      // Base 50 -> 30 GBP
    fixedBase: 30,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "€ EUR",
    rate: 0.72,     // Base 50 -> 36 EUR
    fixedBase: 36,
  }
};

// Auto-detect currency based on browser timezone/locale
function detectRegionCurrency() {
  if (typeof window === "undefined") return "CAD";
  try {
    const timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase();

    // 1. United Kingdom check
    if (timeZone.startsWith("europe/london") || timeZone.includes("belfast") || lang.endsWith("-gb") || lang === "en-gb") {
      return "GBP";
    }
    // 2. Europe check
    if (timeZone.startsWith("europe/") || lang.endsWith("-de") || lang.endsWith("-fr") || lang.endsWith("-it") || lang.endsWith("-es") || lang.endsWith("-nl")) {
      return "EUR";
    }
    // 3. Canada check
    if (timeZone.startsWith("america/toronto") || timeZone.startsWith("america/vancouver") || timeZone.startsWith("america/edmonton") || timeZone.startsWith("america/winnipeg") || timeZone.startsWith("america/halifax") || timeZone.startsWith("america/st_johns") || timeZone.includes("canada") || lang.endsWith("-ca")) {
      return "CAD";
    }
    // 4. United States & Americas outside Canada
    if (timeZone.startsWith("america/") || lang.endsWith("-us") || lang === "en-us") {
      return "USD";
    }
  } catch (e) {
    console.error("Error detecting region currency:", e);
  }
  return "CAD";
}

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState("CAD");

  useEffect(() => {
    const detected = detectRegionCurrency();
    setCurrencyCode(detected);
  }, []);

  const changeCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyCode(code);
      if (typeof window !== "undefined") {
        localStorage.setItem("__rehbar_currency__", code);
      }
    }
  };

  const current = CURRENCIES[currencyCode] || CURRENCIES.CAD;

  // Converts base price (usually 50 stored in DB) to regional numeric price
  const convertPrice = (basePrice) => {
    const num = Number(basePrice) || 0;
    // If exact standard shirt base price (50 or 55), use exact regional tier requested (55 CAD, 40 USD, 30 GBP, 36 EUR)
    if (num === 50 || num === 55) {
      return current.fixedBase;
    }
    return Math.round(num * current.rate);
  };

  // Formats price string like 'CA$55', '$40 USD', '£30 GBP'
  const formatPrice = (basePrice) => {
    const converted = convertPrice(basePrice);
    if (currencyCode === "CAD") {
      return `CA$${converted}`;
    } else if (currencyCode === "USD") {
      return `$${converted} USD`;
    } else if (currencyCode === "GBP") {
      return `£${converted} GBP`;
    } else if (currencyCode === "EUR") {
      return `€${converted} EUR`;
    }
    return `${current.symbol}${converted}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency: currencyCode,
      currencyInfo: current,
      setCurrency: changeCurrency,
      convertPrice,
      formatPrice,
      availableCurrencies: Object.values(CURRENCIES)
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      currency: "CAD",
      currencyInfo: CURRENCIES.CAD,
      setCurrency: () => {},
      convertPrice: (p) => Number(p) === 50 ? 55 : Number(p),
      formatPrice: (p) => `CA$${Number(p) === 50 ? 55 : Number(p)}`,
      availableCurrencies: Object.values(CURRENCIES)
    };
  }
  return context;
}
