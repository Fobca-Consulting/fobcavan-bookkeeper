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
  businessImplication: string;
  status: "excellent" | "good" | "fair" | "poor";
}

const calculateRatios = (data: FinancialData): { [key: string]: Ratio[] } => {
  return {
    liquidity: [
      {
        name: "Current Ratio",
        value: data.currentAssets / data.currentLiabilities,
        formula: "Current Assets / Current Liabilities",
        interpretation: "Measures your company's ability to pay short-term obligations",
        businessImplication: `With a current ratio of ${(data.currentAssets / data.currentLiabilities).toFixed(2)}, your business ${data.currentAssets / data.currentLiabilities >= 2 ? "has excellent short-term financial health. You can easily cover current liabilities and have substantial working capital for operations and growth opportunities." : data.currentAssets / data.currentLiabilities >= 1.5 ? "maintains good liquidity position. You can comfortably meet short-term obligations while maintaining operational flexibility." : data.currentAssets / data.currentLiabilities >= 1 ? "has adequate liquidity but should monitor cash flow closely. Consider improving collection processes or managing inventory more efficiently." : "faces liquidity challenges. Immediate action needed to improve cash position - consider accelerating receivables collection, extending payables terms, or securing additional funding."}`,
        status: data.currentAssets / data.currentLiabilities >= 2 ? "excellent" : 
                data.currentAssets / data.currentLiabilities >= 1.5 ? "good" : 
                data.currentAssets / data.currentLiabilities >= 1 ? "fair" : "poor"
      },
      {
        name: "Quick Ratio",
        value: data.quickAssets / data.currentLiabilities,
        formula: "(Current Assets - Inventory) / Current Liabilities",
        interpretation: "Measures your company's ability to pay short-term debts without selling inventory",
        businessImplication: `Your quick ratio of ${(data.quickAssets / data.currentLiabilities).toFixed(2)} indicates ${data.quickAssets / data.currentLiabilities >= 1.5 ? "exceptional liquidity strength. Your business can meet all short-term obligations using only the most liquid assets, providing excellent financial flexibility for strategic decisions." : data.quickAssets / data.currentLiabilities >= 1 ? "solid financial position. You can cover short-term debts with liquid assets alone, reducing dependency on inventory turnover for cash flow." : data.quickAssets / data.currentLiabilities >= 0.8 ? "reasonable liquidity but room for improvement. Focus on accelerating receivables collection and maintaining optimal cash levels." : "potential cash flow concerns. Your business may struggle to meet obligations without converting inventory to cash, requiring immediate attention to liquidity management."}`,
        status: data.quickAssets / data.currentLiabilities >= 1.5 ? "excellent" : 
                data.quickAssets / data.currentLiabilities >= 1 ? "good" : 
                data.quickAssets / data.currentLiabilities >= 0.8 ? "fair" : "poor"
      },
      {
        name: "Cash Ratio",
        value: data.cash / data.currentLiabilities,
        formula: "Cash / Current Liabilities",
        interpretation: "Measures your company's ability to pay short-term debts with cash only",
        businessImplication: `With a cash ratio of ${(data.cash / data.currentLiabilities).toFixed(2)}, your business ${data.cash / data.currentLiabilities >= 0.5 ? "maintains excellent cash reserves. You have substantial immediately available funds to handle unexpected expenses or capitalize on time-sensitive opportunities without requiring external financing." : data.cash / data.currentLiabilities >= 0.2 ? "has good cash management. Your available cash provides reasonable cushion for operations while indicating efficient capital deployment rather than excessive idle cash." : data.cash / data.currentLiabilities >= 0.1 ? "operates with minimal cash buffers. Consider building cash reserves to improve financial resilience and reduce vulnerability to unexpected cash flow disruptions." : "has very limited cash availability. This creates significant risk exposure and may require immediate cash flow improvement strategies or emergency funding arrangements."}`,
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
        interpretation: "Shows how much revenue your business retains after direct costs",
        businessImplication: `Your gross profit margin of ${((data.grossProfit / data.revenue) * 100).toFixed(1)}% ${(data.grossProfit / data.revenue) * 100 >= 40 ? "demonstrates excellent cost control and strong pricing power. Your business efficiently manages direct costs while maintaining competitive pricing, indicating strong operational efficiency." : (data.grossProfit / data.revenue) * 100 >= 25 ? "shows good profitability from core operations. You're managing direct costs well, but there may be opportunities to optimize pricing or reduce costs further." : (data.grossProfit / data.revenue) * 100 >= 15 ? "indicates basic profitability but suggests room for improvement. Consider reviewing supplier contracts, optimizing inventory management, or adjusting pricing strategies." : "reveals concerning profitability issues. Immediate attention needed to reduce direct costs, improve pricing, or restructure operations to ensure business viability."}`,
        status: (data.grossProfit / data.revenue) * 100 >= 40 ? "excellent" : 
                (data.grossProfit / data.revenue) * 100 >= 25 ? "good" : 
                (data.grossProfit / data.revenue) * 100 >= 15 ? "fair" : "poor"
      },
      {
        name: "Net Profit Margin",
        value: (data.netIncome / data.revenue) * 100,
        formula: "(Net Income / Revenue) × 100",
        interpretation: "Shows the percentage of revenue your business converts to profit",
        businessImplication: `Your net profit margin of ${((data.netIncome / data.revenue) * 100).toFixed(1)}% ${(data.netIncome / data.revenue) * 100 >= 20 ? "represents outstanding overall profitability. Your business demonstrates excellent cost management across all operations and strong competitive positioning in the market." : (data.netIncome / data.revenue) * 100 >= 10 ? "shows solid profitability and good business management. You're effectively controlling both direct and indirect costs while generating healthy returns." : (data.netIncome / data.revenue) * 100 >= 5 ? "indicates modest profitability with opportunities for improvement. Review operating expenses and explore ways to increase efficiency or revenue per customer." : "signals profitability challenges requiring immediate action. Focus on cost reduction, operational efficiency improvements, and revenue optimization strategies."}`,
        status: (data.netIncome / data.revenue) * 100 >= 20 ? "excellent" : 
                (data.netIncome / data.revenue) * 100 >= 10 ? "good" : 
                (data.netIncome / data.revenue) * 100 >= 5 ? "fair" : "poor"
      },
      {
        name: "Return on Assets (ROA)",
        value: (data.netIncome / data.totalAssets) * 100,
        formula: "(Net Income / Total Assets) × 100",
        interpretation: "Measures how efficiently your business uses assets to generate profit",
        businessImplication: `Your ROA of ${((data.netIncome / data.totalAssets) * 100).toFixed(1)}% ${(data.netIncome / data.totalAssets) * 100 >= 15 ? "demonstrates exceptional asset utilization. Your business maximizes returns from every dollar invested in assets, indicating superior management efficiency and strong competitive advantages." : (data.netIncome / data.totalAssets) * 100 >= 8 ? "shows good asset efficiency. Your business effectively converts assets into profits, suggesting sound investment decisions and operational management." : (data.netIncome / data.totalAssets) * 100 >= 3 ? "indicates room for improvement in asset utilization. Consider optimizing asset deployment, reducing underperforming investments, or improving operational efficiency." : "suggests poor asset utilization requiring strategic review. Evaluate asset productivity, consider divestment of underperforming assets, and focus on core profitable activities."}`,
        status: (data.netIncome / data.totalAssets) * 100 >= 15 ? "excellent" : 
                (data.netIncome / data.totalAssets) * 100 >= 8 ? "good" : 
                (data.netIncome / data.totalAssets) * 100 >= 3 ? "fair" : "poor"
      },
      {
        name: "Return on Equity (ROE)",
        value: (data.netIncome / data.totalEquity) * 100,
        formula: "(Net Income / Total Equity) × 100",
        interpretation: "Shows the return your business generates on shareholders' equity",
        businessImplication: `Your ROE of ${((data.netIncome / data.totalEquity) * 100).toFixed(1)}% ${(data.netIncome / data.totalEquity) * 100 >= 20 ? "delivers outstanding returns to equity holders. This exceptional performance demonstrates strong business fundamentals and excellent management of shareholder investments." : (data.netIncome / data.totalEquity) * 100 >= 12 ? "provides good returns for equity investors. Your business effectively uses shareholder capital to generate profits, indicating sound financial management." : (data.netIncome / data.totalEquity) * 100 >= 6 ? "shows moderate returns with potential for enhancement. Consider strategies to improve profitability or optimize capital structure to better serve stakeholder interests." : "indicates disappointing returns for equity holders. Urgent attention needed to improve profitability and justify the capital invested in the business."}`,
        status: (data.netIncome / data.totalEquity) * 100 >= 20 ? "excellent" : 
                (data.netIncome / data.totalEquity) * 100 >= 12 ? "good" : 
                (data.netIncome / data.totalEquity) * 100 >= 6 ? "fair" : "poor"
      },
      {
        name: "Operating Profit Margin",
        value: (data.operatingIncome / data.revenue) * 100,
        formula: "(Operating Income / Revenue) × 100",
        interpretation: "Measures profitability from your core business operations",
        businessImplication: `Your operating margin of ${((data.operatingIncome / data.revenue) * 100).toFixed(1)}% ${(data.operatingIncome / data.revenue) * 100 >= 25 ? "demonstrates exceptional operational efficiency. Your core business activities generate strong profits, indicating excellent cost control and operational management." : (data.operatingIncome / data.revenue) * 100 >= 15 ? "shows strong operational performance. Your business efficiently manages operating costs while maintaining good profit generation from core activities." : (data.operatingIncome / data.revenue) * 100 >= 8 ? "indicates adequate operational efficiency with improvement opportunities. Review operating processes and overhead costs to enhance core business profitability." : "reveals operational challenges requiring immediate attention. Focus on streamlining operations, reducing overhead costs, and improving operational efficiency."}`,
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
        interpretation: "Shows the amount of debt your business has relative to equity",
        businessImplication: `Your debt-to-equity ratio of ${(data.totalLiabilities / data.totalEquity).toFixed(2)} ${data.totalLiabilities / data.totalEquity <= 0.3 ? "indicates excellent financial stability with minimal debt burden. Your business maintains strong financial independence and low financial risk." : data.totalLiabilities / data.totalEquity <= 0.6 ? "shows good financial balance with moderate debt levels. Your business maintains healthy leverage while preserving financial flexibility." : data.totalLiabilities / data.totalEquity <= 1 ? "suggests moderate debt levels requiring careful monitoring. Consider debt reduction strategies to improve financial stability and reduce risk." : "indicates high debt burden that could strain financial resources. Prioritize debt reduction and cash flow improvement to strengthen financial position."}`,
        status: data.totalLiabilities / data.totalEquity <= 0.3 ? "excellent" : 
                data.totalLiabilities / data.totalEquity <= 0.6 ? "good" : 
                data.totalLiabilities / data.totalEquity <= 1 ? "fair" : "poor"
      },
      {
        name: "Debt Ratio",
        value: (data.totalLiabilities / data.totalAssets) * 100,
        formula: "(Total Liabilities / Total Assets) × 100",
        interpretation: "Shows the percentage of assets financed by debt",
        businessImplication: `With ${((data.totalLiabilities / data.totalAssets) * 100).toFixed(1)}% of assets financed by debt, your business ${(data.totalLiabilities / data.totalAssets) * 100 <= 30 ? "maintains excellent financial independence with minimal reliance on debt financing. This provides strong financial flexibility and low risk profile." : (data.totalLiabilities / data.totalAssets) * 100 <= 50 ? "shows balanced financing with moderate debt levels. You maintain good financial stability while leveraging debt for growth opportunities." : (data.totalLiabilities / data.totalAssets) * 100 <= 70 ? "has significant debt financing that requires careful management. Monitor debt service capabilities and consider debt reduction strategies." : "relies heavily on debt financing, creating potential financial risks. Focus on improving equity position and reducing debt dependency."}`,
        status: (data.totalLiabilities / data.totalAssets) * 100 <= 30 ? "excellent" : 
                (data.totalLiabilities / data.totalAssets) * 100 <= 50 ? "good" : 
                (data.totalLiabilities / data.totalAssets) * 100 <= 70 ? "fair" : "poor"
      },
      {
        name: "Interest Coverage Ratio",
        value: data.operatingIncome / data.interestExpense,
        formula: "Operating Income / Interest Expense",
        interpretation: "Measures your business's ability to pay interest on outstanding debt",
        businessImplication: `Your interest coverage ratio of ${(data.operatingIncome / data.interestExpense).toFixed(1)} ${data.operatingIncome / data.interestExpense >= 8 ? "demonstrates exceptional debt service capability. Your business easily covers interest obligations with substantial safety margin, indicating strong financial health." : data.operatingIncome / data.interestExpense >= 4 ? "shows good debt service ability with adequate coverage of interest payments. Your business maintains comfortable debt service capability." : data.operatingIncome / data.interestExpense >= 2 ? "indicates minimal interest coverage requiring careful monitoring. Consider debt reduction or revenue improvement to strengthen debt service capability." : "reveals concerning debt service challenges. Immediate action needed to improve cash flow or reduce debt burden to avoid financial distress."}`,
        status: data.operatingIncome / data.interestExpense >= 8 ? "excellent" : 
                data.operatingIncome / data.interestExpense >= 4 ? "good" : 
                data.operatingIncome / data.interestExpense >= 2 ? "fair" : "poor"
      },
      {
        name: "Equity Ratio",
        value: (data.totalEquity / data.totalAssets) * 100,
        formula: "(Total Equity / Total Assets) × 100",
        interpretation: "Shows the percentage of assets financed by equity",
        businessImplication: `With ${((data.totalEquity / data.totalAssets) * 100).toFixed(1)}% equity financing, your business ${(data.totalEquity / data.totalAssets) * 100 >= 70 ? "maintains excellent financial independence and stability. Strong equity position provides significant financial flexibility and low risk profile." : (data.totalEquity / data.totalAssets) * 100 >= 50 ? "shows balanced capital structure with good equity foundation. You maintain solid financial stability while optimizing capital structure." : (data.totalEquity / data.totalAssets) * 100 >= 30 ? "has moderate equity financing with room for improvement. Consider strengthening equity position to reduce financial risk and improve stability." : "relies heavily on debt financing, creating potential financial vulnerabilities. Focus on building equity through retained earnings or additional investment."}`,
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
        interpretation: "Measures how quickly your business sells inventory",
        businessImplication: `Your inventory turnover of ${(data.costOfGoodsSold / data.inventory).toFixed(1)} times per year ${data.costOfGoodsSold / data.inventory >= 6 ? "demonstrates excellent inventory management. Your business efficiently converts inventory to sales, minimizing carrying costs and maximizing cash flow." : data.costOfGoodsSold / data.inventory >= 4 ? "shows good inventory management with efficient sales conversion. You maintain reasonable inventory levels while meeting customer demand." : data.costOfGoodsSold / data.inventory >= 2 ? "indicates slow inventory movement requiring attention. Consider demand forecasting improvements, inventory optimization, or marketing strategies to accelerate sales." : "reveals concerning inventory stagnation. Immediate action needed to reduce inventory levels, improve sales processes, or liquidate slow-moving stock."}`,
        status: data.costOfGoodsSold / data.inventory >= 6 ? "excellent" : 
                data.costOfGoodsSold / data.inventory >= 4 ? "good" : 
                data.costOfGoodsSold / data.inventory >= 2 ? "fair" : "poor"
      },
      {
        name: "Accounts Receivable Turnover",
        value: data.revenue / data.accountsReceivable,
        formula: "Revenue / Average Accounts Receivable",
        interpretation: "Measures how quickly your business collects receivables",
        businessImplication: `Your receivables turnover of ${(data.revenue / data.accountsReceivable).toFixed(1)} times per year ${data.revenue / data.accountsReceivable >= 10 ? "demonstrates excellent collection efficiency. Your business quickly converts sales to cash, optimizing cash flow and reducing bad debt risk." : data.revenue / data.accountsReceivable >= 6 ? "shows good collection practices with reasonable receivables management. You maintain effective customer payment processes." : data.revenue / data.accountsReceivable >= 4 ? "indicates slower collection processes requiring improvement. Consider stricter credit terms, better follow-up procedures, or incentives for early payment." : "reveals concerning collection inefficiencies. Immediate attention needed to improve collection processes, review credit policies, and accelerate cash conversion."}`,
        status: data.revenue / data.accountsReceivable >= 10 ? "excellent" : 
                data.revenue / data.accountsReceivable >= 6 ? "good" : 
                data.revenue / data.accountsReceivable >= 4 ? "fair" : "poor"
      },
      {
        name: "Accounts Payable Turnover",
        value: data.costOfGoodsSold / data.accountsPayable,
        formula: "Cost of Goods Sold / Average Accounts Payable",
        interpretation: "Measures how quickly your business pays suppliers",
        businessImplication: `Your payables turnover of ${(data.costOfGoodsSold / data.accountsPayable).toFixed(1)} times per year ${data.costOfGoodsSold / data.accountsPayable >= 8 ? "shows you pay suppliers quickly, which may indicate strong cash position but could also suggest missing opportunities to optimize cash flow through extended payment terms." : data.costOfGoodsSold / data.accountsPayable >= 4 ? "indicates balanced supplier payment practices, maintaining good relationships while optimizing cash flow timing." : "suggests extended payment periods which may indicate cash flow constraints or strategic cash management. Ensure supplier relationships remain positive."}`,
        status: data.costOfGoodsSold / data.accountsPayable >= 8 ? "good" : 
                data.costOfGoodsSold / data.accountsPayable >= 4 ? "fair" : "poor"
      },
      {
        name: "Asset Turnover Ratio",
        value: data.revenue / data.totalAssets,
        formula: "Revenue / Total Assets",
        interpretation: "Measures how efficiently your business uses assets to generate revenue",
        businessImplication: `Your asset turnover of ${(data.revenue / data.totalAssets).toFixed(2)} ${data.revenue / data.totalAssets >= 2 ? "demonstrates exceptional asset utilization. Your business maximizes revenue generation from every dollar of assets, indicating superior operational efficiency." : data.revenue / data.totalAssets >= 1 ? "shows good asset efficiency with solid revenue generation from your asset base. You effectively deploy assets to drive business growth." : data.revenue / data.totalAssets >= 0.5 ? "indicates moderate asset utilization with improvement opportunities. Consider optimizing asset deployment or increasing sales to better leverage your asset base." : "suggests poor asset productivity requiring strategic review. Focus on improving sales processes, optimizing asset utilization, or divesting underperforming assets."}`,
        status: data.revenue / data.totalAssets >= 2 ? "excellent" : 
                data.revenue / data.totalAssets >= 1 ? "good" : 
                data.revenue / data.totalAssets >= 0.5 ? "fair" : "poor"
      },
      {
        name: "Days Sales Outstanding",
        value: (data.accountsReceivable / data.revenue) * 365,
        formula: "(Accounts Receivable / Revenue) × 365",
        interpretation: "Shows the average days required to collect receivables",
        businessImplication: `Your average collection period of ${Math.round((data.accountsReceivable / data.revenue) * 365)} days ${(data.accountsReceivable / data.revenue) * 365 <= 30 ? "demonstrates excellent collection efficiency. Your business quickly converts sales to cash, optimizing working capital and reducing credit risk." : (data.accountsReceivable / data.revenue) * 365 <= 45 ? "shows good collection performance with reasonable payment cycles. You maintain effective customer payment management." : (data.accountsReceivable / data.revenue) * 365 <= 60 ? "indicates extended collection periods that may impact cash flow. Consider improving collection processes or tightening credit terms." : "reveals concerning collection delays requiring immediate attention. Focus on improving collection procedures, reviewing customer creditworthiness, and accelerating cash conversion."}`,
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
            <TableHead>Business Performance Analysis</TableHead>
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
              <TableCell className="text-sm text-muted-foreground max-w-md">{ratio.businessImplication}</TableCell>
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