import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface FinancialData {
  cash: number;
  quickAssets: number; // Cash + Short-term investments + Accounts receivable
  currentAssets: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  revenue: number;
  grossProfit: number;
  netIncome: number;
  operatingIncome: number;
  interestExpense: number;
  inventory: number;
  accountsReceivable: number;
  accountsPayable: number;
  costOfGoodsSold: number;
}

// Sample financial data based on the existing data in Reports.tsx
const sampleData: FinancialData = {
  cash: 54100, // Cash + Bank Account
  quickAssets: 66550, // Cash + Bank + AR
  currentAssets: 95300, // Cash + Bank + AR + Inventory
  currentLiabilities: 42450, // All current liabilities
  totalAssets: 124900,
  totalLiabilities: 42450,
  totalEquity: 82450,
  revenue: 156500,
  grossProfit: 88700, // Revenue - COGS (estimated)
  netIncome: 75000, // Revenue - Expenses
  operatingIncome: 78600, // Before interest
  interestExpense: 3600, // Estimated
  inventory: 28750,
  accountsReceivable: 12450,
  accountsPayable: 8200,
  costOfGoodsSold: 67800, // Estimated
};

interface Ratio {
  name: string;
  value: number;
  formula: string;
  interpretation: string;
  status: "excellent" | "good" | "fair" | "poor";
}

const calculateRatios = (data: FinancialData): { [key: string]: Ratio[] } => {
  return {
    liquidity: [
      {
        name: "Current Ratio",
        value: data.currentAssets / data.currentLiabilities,
        formula: "Current Assets / Current Liabilities",
        interpretation: "Measures ability to pay short-term obligations",
        status: data.currentAssets / data.currentLiabilities >= 2 ? "excellent" : 
                data.currentAssets / data.currentLiabilities >= 1.5 ? "good" : 
                data.currentAssets / data.currentLiabilities >= 1 ? "fair" : "poor"
      },
      {
        name: "Quick Ratio",
        value: data.quickAssets / data.currentLiabilities,
        formula: "(Current Assets - Inventory) / Current Liabilities",
        interpretation: "Measures ability to pay short-term debts without selling inventory",
        status: data.quickAssets / data.currentLiabilities >= 1.5 ? "excellent" : 
                data.quickAssets / data.currentLiabilities >= 1 ? "good" : 
                data.quickAssets / data.currentLiabilities >= 0.8 ? "fair" : "poor"
      },
      {
        name: "Cash Ratio",
        value: data.cash / data.currentLiabilities,
        formula: "Cash / Current Liabilities",
        interpretation: "Measures ability to pay short-term debts with cash only",
        status: data.cash / data.currentLiabilities >= 0.5 ? "excellent" : 
                data.cash / data.currentLiabilities >= 0.2 ? "good" : 
                data.cash / data.currentLiabilities >= 0.1 ? "fair" : "poor"
      }
    ],
    profitability: [
      {
        name: "Gross Profit Margin",
        value: (data.grossProfit / data.revenue) * 100,
        formula: "(Gross Profit / Revenue) × 100",
        interpretation: "Percentage of revenue retained after direct costs",
        status: (data.grossProfit / data.revenue) * 100 >= 40 ? "excellent" : 
                (data.grossProfit / data.revenue) * 100 >= 25 ? "good" : 
                (data.grossProfit / data.revenue) * 100 >= 15 ? "fair" : "poor"
      },
      {
        name: "Net Profit Margin",
        value: (data.netIncome / data.revenue) * 100,
        formula: "(Net Income / Revenue) × 100",
        interpretation: "Percentage of revenue converted to profit",
        status: (data.netIncome / data.revenue) * 100 >= 20 ? "excellent" : 
                (data.netIncome / data.revenue) * 100 >= 10 ? "good" : 
                (data.netIncome / data.revenue) * 100 >= 5 ? "fair" : "poor"
      },
      {
        name: "Return on Assets (ROA)",
        value: (data.netIncome / data.totalAssets) * 100,
        formula: "(Net Income / Total Assets) × 100",
        interpretation: "How efficiently assets generate profit",
        status: (data.netIncome / data.totalAssets) * 100 >= 15 ? "excellent" : 
                (data.netIncome / data.totalAssets) * 100 >= 8 ? "good" : 
                (data.netIncome / data.totalAssets) * 100 >= 3 ? "fair" : "poor"
      },
      {
        name: "Return on Equity (ROE)",
        value: (data.netIncome / data.totalEquity) * 100,
        formula: "(Net Income / Total Equity) × 100",
        interpretation: "Return generated on shareholders' equity",
        status: (data.netIncome / data.totalEquity) * 100 >= 20 ? "excellent" : 
                (data.netIncome / data.totalEquity) * 100 >= 12 ? "good" : 
                (data.netIncome / data.totalEquity) * 100 >= 6 ? "fair" : "poor"
      },
      {
        name: "Operating Profit Margin",
        value: (data.operatingIncome / data.revenue) * 100,
        formula: "(Operating Income / Revenue) × 100",
        interpretation: "Profitability from core operations",
        status: (data.operatingIncome / data.revenue) * 100 >= 25 ? "excellent" : 
                (data.operatingIncome / data.revenue) * 100 >= 15 ? "good" : 
                (data.operatingIncome / data.revenue) * 100 >= 8 ? "fair" : "poor"
      }
    ],
    solvency: [
      {
        name: "Debt-to-Equity Ratio",
        value: data.totalLiabilities / data.totalEquity,
        formula: "Total Liabilities / Total Equity",
        interpretation: "Amount of debt relative to equity",
        status: data.totalLiabilities / data.totalEquity <= 0.3 ? "excellent" : 
                data.totalLiabilities / data.totalEquity <= 0.6 ? "good" : 
                data.totalLiabilities / data.totalEquity <= 1 ? "fair" : "poor"
      },
      {
        name: "Debt Ratio",
        value: (data.totalLiabilities / data.totalAssets) * 100,
        formula: "(Total Liabilities / Total Assets) × 100",
        interpretation: "Percentage of assets financed by debt",
        status: (data.totalLiabilities / data.totalAssets) * 100 <= 30 ? "excellent" : 
                (data.totalLiabilities / data.totalAssets) * 100 <= 50 ? "good" : 
                (data.totalLiabilities / data.totalAssets) * 100 <= 70 ? "fair" : "poor"
      },
      {
        name: "Interest Coverage Ratio",
        value: data.operatingIncome / data.interestExpense,
        formula: "Operating Income / Interest Expense",
        interpretation: "Ability to pay interest on outstanding debt",
        status: data.operatingIncome / data.interestExpense >= 8 ? "excellent" : 
                data.operatingIncome / data.interestExpense >= 4 ? "good" : 
                data.operatingIncome / data.interestExpense >= 2 ? "fair" : "poor"
      },
      {
        name: "Equity Ratio",
        value: (data.totalEquity / data.totalAssets) * 100,
        formula: "(Total Equity / Total Assets) × 100",
        interpretation: "Percentage of assets financed by equity",
        status: (data.totalEquity / data.totalAssets) * 100 >= 70 ? "excellent" : 
                (data.totalEquity / data.totalAssets) * 100 >= 50 ? "good" : 
                (data.totalEquity / data.totalAssets) * 100 >= 30 ? "fair" : "poor"
      }
    ],
    efficiency: [
      {
        name: "Inventory Turnover",
        value: data.costOfGoodsSold / data.inventory,
        formula: "Cost of Goods Sold / Average Inventory",
        interpretation: "How quickly inventory is sold",
        status: data.costOfGoodsSold / data.inventory >= 6 ? "excellent" : 
                data.costOfGoodsSold / data.inventory >= 4 ? "good" : 
                data.costOfGoodsSold / data.inventory >= 2 ? "fair" : "poor"
      },
      {
        name: "Accounts Receivable Turnover",
        value: data.revenue / data.accountsReceivable,
        formula: "Revenue / Average Accounts Receivable",
        interpretation: "How quickly receivables are collected",
        status: data.revenue / data.accountsReceivable >= 10 ? "excellent" : 
                data.revenue / data.accountsReceivable >= 6 ? "good" : 
                data.revenue / data.accountsReceivable >= 4 ? "fair" : "poor"
      },
      {
        name: "Accounts Payable Turnover",
        value: data.costOfGoodsSold / data.accountsPayable,
        formula: "Cost of Goods Sold / Average Accounts Payable",
        interpretation: "How quickly payables are paid",
        status: data.costOfGoodsSold / data.accountsPayable >= 8 ? "good" : 
                data.costOfGoodsSold / data.accountsPayable >= 4 ? "fair" : "poor"
      },
      {
        name: "Asset Turnover Ratio",
        value: data.revenue / data.totalAssets,
        formula: "Revenue / Total Assets",
        interpretation: "How efficiently assets generate revenue",
        status: data.revenue / data.totalAssets >= 2 ? "excellent" : 
                data.revenue / data.totalAssets >= 1 ? "good" : 
                data.revenue / data.totalAssets >= 0.5 ? "fair" : "poor"
      },
      {
        name: "Days Sales Outstanding",
        value: (data.accountsReceivable / data.revenue) * 365,
        formula: "(Accounts Receivable / Revenue) × 365",
        interpretation: "Average days to collect receivables",
        status: (data.accountsReceivable / data.revenue) * 365 <= 30 ? "excellent" : 
                (data.accountsReceivable / data.revenue) * 365 <= 45 ? "good" : 
                (data.accountsReceivable / data.revenue) * 365 <= 60 ? "fair" : "poor"
      }
    ]
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent": return "bg-green-100 text-green-800";
    case "good": return "bg-blue-100 text-blue-800";
    case "fair": return "bg-yellow-100 text-yellow-800";
    case "poor": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatRatioValue = (value: number, name: string) => {
  if (name.includes("Margin") || name.includes("ROA") || name.includes("ROE") || name.includes("Ratio") && name.includes("Debt")) {
    return `${value.toFixed(2)}${name.includes("Margin") || name.includes("ROA") || name.includes("ROE") || name.includes("Debt Ratio") || name.includes("Equity Ratio") ? "%" : ""}`;
  }
  if (name === "Days Sales Outstanding") {
    return `${Math.round(value)} days`;
  }
  return value.toFixed(2);
};

export const FinancialRatios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const ratios = calculateRatios(sampleData);

  const RatioSection = ({ title, ratios: sectionRatios }: { title: string; ratios: Ratio[] }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ratio</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Formula</TableHead>
            <TableHead>Interpretation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectionRatios.map((ratio, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{ratio.name}</TableCell>
              <TableCell className="font-mono">{formatRatioValue(ratio.value, ratio.name)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(ratio.status)}>
                  {ratio.status.charAt(0).toUpperCase() + ratio.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{ratio.formula}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{ratio.interpretation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Financial Ratios Analysis</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Performance indicators and financial health metrics</p>
        </div>
        <div className="w-[180px]">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
              <SelectItem value="previous-year">Previous Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <RatioSection title="1. Liquidity Ratios" ratios={ratios.liquidity} />
        <RatioSection title="2. Profitability Ratios" ratios={ratios.profitability} />
        <RatioSection title="3. Solvency Ratios (Leverage Ratios)" ratios={ratios.solvency} />
        <RatioSection title="4. Efficiency Ratios (Activity Ratios)" ratios={ratios.efficiency} />
      </CardContent>
    </Card>
  );
};