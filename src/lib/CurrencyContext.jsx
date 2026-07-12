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
    const saved = localStorage.getItem("__rehbar_currency__");
    if (saved && CURRENCIES[saved]) return saved;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (timeZone.startsWith("Europe/London") || timeZone.includes("Belfast")) return "GBP";
    if (timeZone.startsWith("Europe/")) return "EUR";
    if (timeZone.startsWith("America/Toronto") || timeZone.startsWith("America/Vancouver") || timeZone.startsWith("America/Edmonton") || timeZone.startsWith("America/Winnipeg") || timeZone.startsWith("America/Halifax") || timeZone.startsWith("America/St_Johns") || timeZone.includes("Canada")) {
      return "CAD";
    }
    if (timeZone.startsWith("America/")) return "USD"; // Default Americas outside Canada to USD
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
