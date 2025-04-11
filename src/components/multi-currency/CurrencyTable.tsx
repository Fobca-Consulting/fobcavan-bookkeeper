
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BadgeDollarSign, Pencil } from "lucide-react";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  exchangeRate: number;
  lastUpdated: string;
};

interface CurrencyTableProps {
  currencies: Currency[];
}

export const CurrencyTable: React.FC<CurrencyTableProps> = ({ currencies }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Currency Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Base Currency</TableHead>
          <TableHead className="text-right">Exchange Rate (to USD)</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currencies.map(currency => (
          <TableRow key={currency.code}>
            <TableCell className="font-medium">{currency.code}</TableCell>
            <TableCell>{currency.name}</TableCell>
            <TableCell>{currency.symbol}</TableCell>
            <TableCell>
              {currency.isBase ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <BadgeDollarSign className="h-3 w-3 mr-1" />
                  Base
                </span>
              ) : null}
            </TableCell>
            <TableCell className="text-right">{currency.exchangeRate.toFixed(4)}</TableCell>
            <TableCell>{currency.lastUpdated}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
