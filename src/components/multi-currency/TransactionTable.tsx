
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

type Transaction = {
  id: number;
  date: string;
  description: string;
  originalCurrency: string;
  originalAmount: number;
  baseCurrency: string;
  baseAmount: number;
  type: string;
};

interface TransactionTableProps {
  transactions: Transaction[];
  currencies: Array<{ code: string; symbol: string }>;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currencies,
}) => {
  const formatCurrencyWithCode = (amount: number, currencyCode: string) => {
    return formatCurrency(amount, currencyCode, currencies);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Original Amount</TableHead>
          <TableHead className="text-right">Base Amount (USD)</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map(transaction => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell className="font-medium">{transaction.description}</TableCell>
            <TableCell className="text-right">
              {formatCurrencyWithCode(transaction.originalAmount, transaction.originalCurrency)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrencyWithCode(transaction.baseAmount, transaction.baseCurrency)}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                transaction.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
