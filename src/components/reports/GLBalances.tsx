import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, FileSpreadsheet, Search } from "lucide-react";

interface GLBalance {
  glCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  debitMovements: number;
  creditMovements: number;
  closingBalance: number;
}

const mockGLBalances: GLBalance[] = [
  {
    glCode: "1001",
    accountName: "Cash",
    accountType: "Asset",
    openingBalance: 50000,
    debitMovements: 25000,
    creditMovements: 20900,
    closingBalance: 54100
  },
  {
    glCode: "1200", 
    accountName: "Accounts Receivable",
    accountType: "Asset",
    openingBalance: 10000,
    debitMovements: 15000,
    creditMovements: 12550,
    closingBalance: 12450
  },
  {
    glCode: "1300",
    accountName: "Inventory", 
    accountType: "Asset",
    openingBalance: 30000,
    debitMovements: 45000,
    creditMovements: 46250,
    closingBalance: 28750
  },
  {
    glCode: "2001",
    accountName: "Accounts Payable",
    accountType: "Liability",
    openingBalance: 5000,
    debitMovements: 12000,
    creditMovements: 15200,
    closingBalance: 8200
  },
  {
    glCode: "4001",
    accountName: "Service Revenue",
    accountType: "Revenue", 
    openingBalance: 0,
    debitMovements: 0,
    creditMovements: 85500,
    closingBalance: 85500
  },
  {
    glCode: "5001",
    accountName: "Rent Expense",
    accountType: "Expense",
    openingBalance: 0,
    debitMovements: 12000,
    creditMovements: 0,
    closingBalance: 12000
  }
];

const GLBalances = () => {
  const [asAtDate, setAsAtDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [balances] = useState<GLBalance[]>(mockGLBalances);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredBalances = balances.filter(balance =>
    balance.glCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    console.log("Downloading PDF...");
  };

  const downloadExcel = () => {
    console.log("Downloading Excel...");
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      "Asset": "text-blue-600",
      "Liability": "text-red-600", 
      "Equity": "text-purple-600",
      "Revenue": "text-green-600",
      "Expense": "text-orange-600"
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              General Ledger Balances
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              As at {new Date(asAtDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="asAtDate">As at Date</Label>
            <Input
              id="asAtDate"
              type="date"
              value={asAtDate}
              onChange={(e) => setAsAtDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">Search Accounts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by GL Code or Account Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* GL Balances Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GL Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Opening Balance</TableHead>
              <TableHead className="text-right">Debit Movements</TableHead>
              <TableHead className="text-right">Credit Movements</TableHead>
              <TableHead className="text-right">Closing Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBalances.map((balance, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{balance.glCode}</TableCell>
                <TableCell>{balance.accountName}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getAccountTypeColor(balance.accountType)}`}>
                    {balance.accountType}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(balance.openingBalance)}
                </TableCell>
                <TableCell className="text-right">
                  {balance.debitMovements > 0 ? formatCurrency(balance.debitMovements) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {balance.creditMovements > 0 ? formatCurrency(balance.creditMovements) : "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(balance.closingBalance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(
                  filteredBalances
                    .filter(b => b.accountType === "Asset")
                    .reduce((sum, b) => sum + b.closingBalance, 0)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(
                  filteredBalances
                    .filter(b => b.accountType === "Liability")
                    .reduce((sum, b) => sum + b.closingBalance, 0)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Liabilities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(
                  filteredBalances
                    .filter(b => b.accountType === "Revenue")
                    .reduce((sum, b) => sum + b.closingBalance, 0)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(
                  filteredBalances
                    .filter(b => b.accountType === "Expense")
                    .reduce((sum, b) => sum + b.closingBalance, 0)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default GLBalances;