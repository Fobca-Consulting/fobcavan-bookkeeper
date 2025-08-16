import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";

interface TrialBalanceEntry {
  glCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

const mockTrialBalance: TrialBalanceEntry[] = [
  { glCode: "1001", accountName: "Cash", debit: 54100, credit: 0 },
  { glCode: "1200", accountName: "Accounts Receivable", debit: 12450, credit: 0 },
  { glCode: "1300", accountName: "Inventory", debit: 28750, credit: 0 },
  { glCode: "1500", accountName: "Equipment", debit: 35000, credit: 0 },
  { glCode: "1510", accountName: "Accumulated Depreciation", debit: 0, credit: 5400 },
  { glCode: "2001", accountName: "Accounts Payable", debit: 0, credit: 8200 },
  { glCode: "2100", accountName: "Loan Payable", debit: 0, credit: 25000 },
  { glCode: "3000", accountName: "Owner's Capital", debit: 0, credit: 50000 },
  { glCode: "3100", accountName: "Retained Earnings", debit: 0, credit: 38850 },
  { glCode: "4001", accountName: "Service Revenue", debit: 0, credit: 85500 },
  { glCode: "4002", accountName: "Product Sales", debit: 0, credit: 67800 },
  { glCode: "5001", accountName: "Rent Expense", debit: 12000, credit: 0 },
  { glCode: "5002", accountName: "Salaries Expense", debit: 45000, credit: 0 },
  { glCode: "5003", accountName: "Utilities Expense", debit: 3500, credit: 0 },
  { glCode: "5004", accountName: "Marketing Expense", debit: 7500, credit: 0 },
  { glCode: "5005", accountName: "Depreciation Expense", debit: 3600, credit: 0 }
];

const TrialBalance = () => {
  const [period, setPeriod] = useState("current-month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalDebits = mockTrialBalance.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = mockTrialBalance.reduce((sum, entry) => sum + entry.credit, 0);

  const downloadPDF = () => {
    // Implementation for PDF download
    console.log("Downloading PDF...");
  };

  const downloadExcel = () => {
    // Implementation for Excel download
    console.log("Downloading Excel...");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Trial Balance
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">As of May 15, 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="previous-month">Previous Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={downloadExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GL Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrialBalance.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{entry.glCode}</TableCell>
                <TableCell>{entry.accountName}</TableCell>
                <TableCell className="text-right">
                  {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell colSpan={2} className="text-right">Total</TableCell>
              <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Balance Check */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Balance Check:</span>
            <span className={`font-bold ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
              {totalDebits === totalCredits ? 'Balanced ✓' : 'Out of Balance ⚠️'}
            </span>
          </div>
          {totalDebits !== totalCredits && (
            <div className="mt-2 text-sm text-muted-foreground">
              Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialBalance;