import React from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const accountsData = {
  assets: [
    { id: 1, code: "1001", name: "Cash", type: "Asset", balance: 8500, description: "Cash on hand" },
    { id: 2, code: "1002", name: "Bank Account", type: "Asset", balance: 45600, description: "Main checking account" },
    { id: 3, code: "1100", name: "Accounts Receivable", type: "Asset", balance: 12450, description: "Money owed by customers" },
    { id: 4, code: "1200", name: "Inventory", type: "Asset", balance: 28750, description: "Inventory items" },
    { id: 5, code: "1500", name: "Equipment", type: "Asset", balance: 35000, description: "Office equipment" },
  ],
  liabilities: [
    { id: 6, code: "2001", name: "Accounts Payable", type: "Liability", balance: 8200, description: "Money owed to vendors" },
    { id: 7, code: "2002", name: "Loan Payable", type: "Liability", balance: 25000, description: "Business loan" },
    { id: 8, code: "2100", name: "Credit Card", type: "Liability", balance: 3450, description: "Company credit card" },
    { id: 9, code: "2200", name: "Payroll Liabilities", type: "Liability", balance: 5800, description: "Employee payroll liabilities" },
  ],
  equity: [
    { id: 10, code: "3001", name: "Owner's Capital", type: "Equity", balance: 50000, description: "Owner's initial investment" },
    { id: 11, code: "3002", name: "Retained Earnings", type: "Equity", balance: 38850, description: "Accumulated earnings" },
  ],
  income: [
    { id: 12, code: "4001", name: "Service Revenue", type: "Income", balance: 85500, description: "Income from services" },
    { id: 13, code: "4002", name: "Product Revenue", type: "Income", balance: 67800, description: "Income from product sales" },
  ],
  expenses: [
    { id: 14, code: "5001", name: "Rent Expense", type: "Expense", balance: 12000, description: "Office rent" },
    { id: 15, code: "5002", name: "Utilities Expense", type: "Expense", balance: 3500, description: "Utility bills" },
    { id: 16, code: "5003", name: "Salaries Expense", type: "Expense", balance: 45000, description: "Employee salaries" },
    { id: 17, code: "5004", name: "Supplies Expense", type: "Expense", balance: 2800, description: "Office supplies" },
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const Accounts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search accounts..."
              className="pl-8 w-full md:max-w-sm"
            />
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
              <TabsTrigger value="equity">Equity</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...accountsData.assets, ...accountsData.liabilities, ...accountsData.equity, ...accountsData.income, ...accountsData.expenses]
                    .map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-muted-foreground">{account.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(account.balance)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>View Transactions</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="assets">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsData.assets.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-muted-foreground">{account.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View Transactions</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="liabilities">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsData.liabilities.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-muted-foreground">{account.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View Transactions</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="equity">
              <div className="py-4">Equity accounts will appear here</div>
            </TabsContent>
            <TabsContent value="income">
              <div className="py-4">Income accounts will appear here</div>
            </TabsContent>
            <TabsContent value="expenses">
              <div className="py-4">Expense accounts will appear here</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounts;
