
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronDown, PlusCircle, FileText, Download, Filter, MoreHorizontal, Calendar, ChevronUp, CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock transaction data
const transactionData = [
  { 
    id: 1, 
    date: "2023-05-15", 
    description: "Sales Revenue", 
    category: "Revenue",
    account: "Sales", 
    reference: "INV-001",
    amount: 2500, 
    type: "income", 
    status: "completed" 
  },
  { 
    id: 2, 
    date: "2023-05-13", 
    description: "Office Supplies", 
    category: "Expense",
    account: "Operating Expenses", 
    reference: "PO-245",
    amount: -350, 
    type: "expense", 
    status: "completed" 
  },
  { 
    id: 3, 
    date: "2023-05-10", 
    description: "Client Payment", 
    category: "Revenue", 
    account: "Accounts Receivable",
    reference: "PAY-123",
    amount: 1800, 
    type: "income", 
    status: "completed" 
  },
  { 
    id: 4, 
    date: "2023-05-08", 
    description: "Utilities", 
    category: "Expense",
    account: "Utilities", 
    reference: "BILL-42",
    amount: -420, 
    type: "expense", 
    status: "completed" 
  },
  { 
    id: 5, 
    date: "2023-05-05", 
    description: "Office Rent", 
    category: "Expense",
    account: "Rent", 
    reference: "RENT-MAY",
    amount: -2200, 
    type: "expense", 
    status: "completed" 
  },
  { 
    id: 6, 
    date: "2023-05-02", 
    description: "Software Subscription", 
    category: "Expense",
    account: "Software", 
    reference: "SUB-001",
    amount: -99, 
    type: "expense", 
    status: "completed" 
  },
  { 
    id: 7, 
    date: "2023-05-01", 
    description: "Product Sales", 
    category: "Revenue",
    account: "Sales", 
    reference: "INV-002",
    amount: 3200, 
    type: "income", 
    status: "completed" 
  }
];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const Transactions = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select defaultValue="this-month">
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Date Range" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            {/* Table content - same for all tabs in this demo */}
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="income">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Income transactions will be displayed here
              </div>
            </TabsContent>
            
            <TabsContent value="expense">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Expense transactions will be displayed here
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Pending transactions will be displayed here
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing 1-7 of 7 transactions
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
