import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparativeData {
  account: string;
  current: number;
  previous: number;
  variance: number;
  percentageChange: number;
}

const mockIncomeData: ComparativeData[] = [
  { account: "Service Revenue", current: 85500, previous: 78000, variance: 7500, percentageChange: 9.62 },
  { account: "Product Sales", current: 67800, previous: 62000, variance: 5800, percentageChange: 9.35 },
  { account: "Total Revenue", current: 156500, previous: 142000, variance: 14500, percentageChange: 10.21 },
  { account: "Rent Expense", current: 12000, previous: 12000, variance: 0, percentageChange: 0 },
  { account: "Salaries Expense", current: 45000, previous: 42000, variance: 3000, percentageChange: 7.14 },
  { account: "Total Expenses", current: 81600, previous: 76500, variance: 5100, percentageChange: 6.67 },
  { account: "Net Income", current: 74900, previous: 65500, variance: 9400, percentageChange: 14.35 }
];

const mockPositionData: ComparativeData[] = [
  { account: "Cash", current: 54100, previous: 48000, variance: 6100, percentageChange: 12.71 },
  { account: "Accounts Receivable", current: 12450, previous: 15200, variance: -2750, percentageChange: -18.09 },
  { account: "Inventory", current: 28750, previous: 32000, variance: -3250, percentageChange: -10.16 },
  { account: "Total Assets", current: 124900, previous: 118500, variance: 6400, percentageChange: 5.40 },
  { account: "Accounts Payable", current: 8200, previous: 9500, variance: -1300, percentageChange: -13.68 },
  { account: "Total Liabilities", current: 42450, previous: 44200, variance: -1750, percentageChange: -3.96 },
  { account: "Total Equity", current: 82450, previous: 74300, variance: 8150, percentageChange: 10.97 }
];

const ComparativeAnalysis = () => {
  const [reportType, setReportType] = useState("income");
  const [comparisonType, setComparisonType] = useState("month-on-month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getVarianceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getVarianceBadge = (change: number) => {
    if (change > 0) {
      return <Badge className="bg-green-100 text-green-800">+{change.toFixed(2)}%</Badge>;
    } else if (change < 0) {
      return <Badge className="bg-red-100 text-red-800">{change.toFixed(2)}%</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">0%</Badge>;
  };

  const currentData = reportType === "income" ? mockIncomeData : mockPositionData;
  const reportTitle = reportType === "income" ? "Income Statement" : "Statement of Financial Position";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Comparative Analysis - {reportTitle}</CardTitle>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income Statement</SelectItem>
                <SelectItem value="position">Financial Position</SelectItem>
              </SelectContent>
            </Select>
            <Select value={comparisonType} onValueChange={setComparisonType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month-on-month">Month on Month</SelectItem>
                <SelectItem value="quarter-on-quarter">Quarter on Quarter</SelectItem>
                <SelectItem value="year-on-year">Year on Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Current Period</TableHead>
              <TableHead className="text-right">Previous Period</TableHead>
              <TableHead className="text-right">Variance ($)</TableHead>
              <TableHead className="text-right">Variance (%)</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item, index) => (
              <TableRow key={index} className={item.account.includes("Total") || item.account === "Net Income" ? "bg-muted/50 font-semibold" : ""}>
                <TableCell className="font-medium">{item.account}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.current)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.previous)}</TableCell>
                <TableCell className={`text-right ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                </TableCell>
                <TableCell className="text-right">
                  {getVarianceBadge(item.percentageChange)}
                </TableCell>
                <TableCell className="text-center">
                  {getVarianceIcon(item.percentageChange)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Key Insights:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {reportType === "income" ? (
              <>
                <div>
                  <strong>Revenue Growth:</strong> The business shows strong revenue growth of 10.21% compared to the previous period, driven by increases in both service revenue and product sales.
                </div>
                <div>
                  <strong>Expense Management:</strong> While expenses increased by 6.67%, they grew at a slower rate than revenue, resulting in improved profitability.
                </div>
                <div>
                  <strong>Net Income Performance:</strong> Net income improved by 14.35%, indicating effective cost control and revenue optimization.
                </div>
                <div>
                  <strong>Operational Efficiency:</strong> The business demonstrates improving operational efficiency with revenue growing faster than expenses.
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong>Asset Growth:</strong> Total assets increased by 5.40%, primarily driven by improved cash position and strategic asset management.
                </div>
                <div>
                  <strong>Liquidity Improvement:</strong> Cash position strengthened by 12.71%, enhancing the business's liquidity and financial flexibility.
                </div>
                <div>
                  <strong>Working Capital:</strong> Accounts receivable decreased by 18.09%, indicating improved collection efficiency and cash conversion.
                </div>
                <div>
                  <strong>Equity Strength:</strong> Total equity increased by 10.97%, demonstrating business growth and retained earnings accumulation.
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparativeAnalysis;