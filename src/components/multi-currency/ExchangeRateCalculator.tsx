
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  exchangeRate: number;
  lastUpdated: string;
};

interface ExchangeRateCalculatorProps {
  currencies: Currency[];
}

export const ExchangeRateCalculator: React.FC<ExchangeRateCalculatorProps> = ({
  currencies,
}) => {
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h3 className="font-medium mb-3">Exchange Rate Calculator</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <Input type="number" placeholder="1.00" defaultValue="1.00" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">From</label>
          <Select defaultValue="USD">
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">To</label>
          <Select defaultValue="EUR">
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 p-3 bg-muted rounded-md flex justify-between items-center">
        <span className="font-medium">Converted Amount:</span>
        <span className="text-lg font-medium">€0.9236</span>
      </div>
    </div>
  );
};
