
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  FileText,
  Printer,
  RefreshCcw,
  Share2,
  ChevronRight,
} from "lucide-react";
import { FinancialRatios } from "@/components/reports/FinancialRatios";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Income Statement Data
const incomeStatementData = {
  revenue: [
    { name: "Service Revenue", amount: 85500 },
    { name: "Product Sales", amount: 67800 },
    { name: "Other Income", amount: 3200 },
  ],
  expenses: [
    { name: "Rent Expense", amount: 12000 },
    { name: "Utilities Expense", amount: 3500 },
    { name: "Salaries Expense", amount: 45000 },
    { name: "Supplies Expense", amount: 2800 },
    { name: "Insurance Expense", amount: 4800 },
    { name: "Marketing Expense", amount: 7500 },
    { name: "Depreciation Expense", amount: 3600 },
    { name: "Other Expenses", amount: 2400 },
  ]
};

// Balance Sheet Data
const balanceSheetData = {
  assets: [
    { name: "Cash", amount: 8500 },
    { name: "Bank Account", amount: 45600 },
    { name: "Accounts Receivable", amount: 12450 },
    { name: "Inventory", amount: 28750 },
    { name: "Equipment", amount: 35000 },
    { name: "Accumulated Depreciation", amount: -5400 },
  ],
  liabilities: [
    { name: "Accounts Payable", amount: 8200 },
    { name: "Loan Payable", amount: 25000 },
    { name: "Credit Card", amount: 3450 },
    { name: "Payroll Liabilities", amount: 5800 },
  ],
  equity: [
    { name: "Owner's Capital", amount: 50000 },
    { name: "Retained Earnings", amount: 38850 },
    { name: "Current Net Income", amount: 81600 - 81600 },
  ]
};

// Accounts Receivable Data
const accountsReceivableData = [
  { customer: "ABC Company", invoice: "INV-1001", date: "2023-04-15", dueDate: "2023-05-15", amount: 2500, status: "overdue" },
  { customer: "XYZ Corporation", invoice: "INV-1002", date: "2023-04-22", dueDate: "2023-05-22", amount: 3800, status: "current" },
  { customer: "Smith Consulting", invoice: "INV-1003", date: "2023-04-30", dueDate: "2023-05-30", amount: 1750, status: "current" },
  { customer: "Johnson LLC", invoice: "INV-1004", date: "2023-05-05", dueDate: "2023-06-05", amount: 4400, status: "current" },
];

// Accounts Payable Data
const accountsPayableData = [
  { vendor: "Office Supplies Inc", invoice: "V-456", date: "2023-04-10", dueDate: "2023-05-10", amount: 1200, status: "overdue" },
  { vendor: "Tech Solutions", invoice: "V-789", date: "2023-04-20", dueDate: "2023-05-20", amount: 3500, status: "current" },
  { vendor: "Utility Services", invoice: "V-123", date: "2023-04-25", dueDate: "2023-05-25", amount: 850, status: "current" },
  { vendor: "Marketing Agency", invoice: "V-321", date: "2023-05-01", dueDate: "2023-06-01", amount: 2650, status: "current" },
];

// Cash Flow Data
const cashFlowData = {
  operating: [
    { description: "Net Income", amount: 49200 },
    { description: "Depreciation", amount: 3600 },
    { description: "Increase in Accounts Receivable", amount: -2800 },
    { description: "Decrease in Inventory", amount: 1500 },
    { description: "Decrease in Accounts Payable", amount: -1200 },
  ],
  investing: [
    { description: "Purchase of Equipment", amount: -8500 },
  ],
  financing: [
    { description: "Loan Payment", amount: -5000 },
    { description: "Owner's Withdrawal", amount: -10000 },
  ]
};

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("income");
  
  // Set active tab based on URL query parameter
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setActiveTab(type);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex flex-wrap gap-2">
          <div className="w-[180px]">
            <Select defaultValue="current-month">
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
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {/* Income Statement Report */}
        <TabsContent value="income">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Income Statement</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">January 1, 2023 - May 15, 2023</p>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Revenue Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Revenue</h3>
                  <Table>
                    <TableBody>
                      {incomeStatementData.revenue.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total Revenue</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(incomeStatementData.revenue.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Expenses Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expenses</h3>
                  <Table>
                    <TableBody>
                      {incomeStatementData.expenses.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total Expenses</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(incomeStatementData.expenses.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Net Income */}
                <div className="border-t pt-4">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-primary/10">
                        <TableCell className="font-bold text-lg">Net Income</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(
                            incomeStatementData.revenue.reduce((sum, item) => sum + item.amount, 0) -
                            incomeStatementData.expenses.reduce((sum, item) => sum + item.amount, 0)
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet Report */}
        <TabsContent value="balance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Balance Sheet</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">As of May 15, 2023</p>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Assets Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Assets</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.assets.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total Assets</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(balanceSheetData.assets.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Liabilities Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Liabilities</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.liabilities.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total Liabilities</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(balanceSheetData.liabilities.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Equity Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Equity</h3>
                  <Table>
                    <TableBody>
                      {balanceSheetData.equity.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total Equity</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Total Liabilities and Equity */}
                <div className="border-t pt-4">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-primary/10">
                        <TableCell className="font-bold text-lg">Total Liabilities and Equity</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(
                            balanceSheetData.liabilities.reduce((sum, item) => sum + item.amount, 0) +
                            balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0)
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Report */}
        <TabsContent value="cashflow">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cash Flow Statement</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">January 1, 2023 - May 15, 2023</p>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Operating Activities */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Operating Activities</h3>
                  <Table>
                    <TableBody>
                      {cashFlowData.operating.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Net Cash from Operating Activities</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(cashFlowData.operating.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Investing Activities */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Investing Activities</h3>
                  <Table>
                    <TableBody>
                      {cashFlowData.investing.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Net Cash from Investing Activities</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(cashFlowData.investing.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Financing Activities */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Financing Activities</h3>
                  <Table>
                    <TableBody>
                      {cashFlowData.financing.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Net Cash from Financing Activities</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(cashFlowData.financing.reduce((sum, item) => sum + item.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Net Cash Flow */}
                <div className="border-t pt-4">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-primary/10">
                        <TableCell className="font-bold text-lg">Net Increase (Decrease) in Cash</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(
                            cashFlowData.operating.reduce((sum, item) => sum + item.amount, 0) +
                            cashFlowData.investing.reduce((sum, item) => sum + item.amount, 0) +
                            cashFlowData.financing.reduce((sum, item) => sum + item.amount, 0)
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Receivable Report */}
        <TabsContent value="ar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accounts Receivable Aging</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">As of May 15, 2023</p>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsReceivableData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.customer}</TableCell>
                      <TableCell>{item.invoice}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status === 'overdue' ? 'Overdue' : 'Current'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-bold">Total Accounts Receivable</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(accountsReceivableData.reduce((sum, item) => sum + item.amount, 0))}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Payable Report */}
        <TabsContent value="ap">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accounts Payable Aging</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">As of May 15, 2023</p>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsPayableData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.vendor}</TableCell>
                      <TableCell>{item.invoice}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status === 'overdue' ? 'Overdue' : 'Current'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-bold">Total Accounts Payable</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(accountsPayableData.reduce((sum, item) => sum + item.amount, 0))}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Ratios Report */}
        <TabsContent value="ratios">
          <FinancialRatios />
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">As of May 15, 2023</p>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                Inventory report will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">January 1, 2023 - May 15, 2023</p>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                Sales report will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Report</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">January 1, 2023 - May 15, 2023</p>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                Expense report will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
