import React, { createContext, useContext, useState } from "react";

const CurrencyContext = createContext();

export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "$ USD",
    rate: 1.0,
    fixedBase: 50,
  }
};

export function CurrencyProvider({ children }) {
  const [currencyCode] = useState("USD");

  const current = CURRENCIES.USD;

  // Converts base price directly (standardized to USD)
  const convertPrice = (basePrice) => {
    const num = Number(basePrice) || 0;
    // Standard shirt base price -> exactly $50 USD
    if (num === 50 || num === 55) {
      return 50;
    }
    return Math.round(num);
  };

  // Formats price string as '$50 USD'
  const formatPrice = (basePrice) => {
    const converted = convertPrice(basePrice);
    return `$${converted} USD`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency: "USD",
      currencyInfo: current,
      setCurrency: () => {},
      convertPrice,
      formatPrice,
      availableCurrencies: [current]
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "USD",
      currencyInfo: CURRENCIES.USD,
      setCurrency: () => {},
      convertPrice: (p) => (Number(p) === 50 || Number(p) === 55 ? 50 : Number(p)),
      formatPrice: (p) => `$${Number(p) === 50 || Number(p) === 55 ? 50 : Number(p)} USD`,
      availableCurrencies: [CURRENCIES.USD]
    };
  }
  return context;
}
