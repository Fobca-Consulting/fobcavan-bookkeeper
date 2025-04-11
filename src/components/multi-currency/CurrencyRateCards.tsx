
import React from "react";
import { formatCurrency } from "@/lib/utils";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  exchangeRate: number;
  lastUpdated: string;
};

interface CurrencyRateCardsProps {
  currencies: Currency[];
}

export const CurrencyRateCards: React.FC<CurrencyRateCardsProps> = ({
  currencies,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {currencies.filter(c => !c.isBase).map(currency => (
        <div key={currency.code} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{currency.code}</div>
            <div className="text-sm text-muted-foreground">{currency.name}</div>
          </div>
          <div className="text-2xl font-semibold">{currency.exchangeRate.toFixed(4)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            1 USD = {formatCurrency(currency.exchangeRate, currency.code, [{ code: currency.code, symbol: currency.symbol }])}
          </div>
        </div>
      ))}
    </div>
  );
};
