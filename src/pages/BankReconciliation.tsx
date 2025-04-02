
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  Download, 
  Plus, 
  RefreshCw, 
  Check, 
  X, 
  FileText, 
  Calendar 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock bank accounts data
const bankAccounts = [
  { id: 1, name: "Main Business Account", bank: "Chase", balance: 24500.75, lastReconciled: "2023-04-30" },
  { id: 2, name: "Savings Account", bank: "Bank of America", balance: 38750.25, lastReconciled: "2023-05-15" },
  { id: 3, name: "Operating Expenses", bank: "Wells Fargo", balance: 12340.50, lastReconciled: "2023-05-01" },
];

// Mock transactions for reconciliation
const bankTransactions = [
  { 
    id: 1, 
    date: "2023-05-25", 
    description: "Client Payment - ABC Corp", 
    reference: "DEP-00123",
    bankAmount: 5500.00, 
    bookAmount: 5500.00, 
    status: "unmatched" 
  },
  { 
    id: 2, 
    date: "2023-05-23", 
    description: "Office Supplies - Staples", 
    reference: "CHK-00456",
    bankAmount: -350.25, 
    bookAmount: -350.25, 
    status: "matched" 
  },
  { 
    id: 3, 
    date: "2023-05-20", 
    description: "Monthly Subscription", 
    reference: "ACH-00789",
    bankAmount: -99.00, 
    bookAmount: -99.00, 
    status: "matched" 
  },
  { 
    id: 4, 
    date: "2023-05-18", 
    description: "Client Payment - XYZ Ltd", 
    reference: "DEP-00124",
    bankAmount: 8750.00, 
    bookAmount: 8750.00, 
    status: "unmatched" 
  },
  { 
    id: 5, 
    date: "2023-05-16", 
    description: "Utility Payment", 
    reference: "ACH-00790",
    bankAmount: -220.50, 
    bookAmount: -220.50, 
    status: "matched" 
  },
];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const BankReconciliation = () => {
  const [selectedBank, setSelectedBank] = useState<string>("1");
  const [reconciledItems, setReconciledItems] = useState<number[]>([2, 3, 5]);
  
  const selectedBankData = bankAccounts.find(account => account.id.toString() === selectedBank);

  const handleReconcileItem = (id: number) => {
    if (reconciledItems.includes(id)) {
      setReconciledItems(reconciledItems.filter(item => item !== id));
    } else {
      setReconciledItems([...reconciledItems, id]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Reconciliation
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Select Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Bank Account</label>
              <Select
                value={selectedBank}
                onValueChange={setSelectedBank}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} ({account.bank})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Statement Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-9" defaultValue="2023-05-31" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Ending Balance</label>
              <Input 
                type="text" 
                placeholder="0.00" 
                defaultValue={selectedBankData ? selectedBankData.balance.toFixed(2) : "0.00"} 
              />
            </div>
          </div>
          
          {selectedBankData && (
            <div className="mt-6 rounded-md bg-muted p-4">
              <p className="text-sm mb-1">
                <span className="font-medium">Last reconciled:</span> {selectedBankData.lastReconciled}
              </p>
              <p className="text-sm">
                <span className="font-medium">Current balance:</span> {formatCurrency(selectedBankData.balance)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reconcile Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unmatched">
            <TabsList className="mb-4">
              <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
              <TabsTrigger value="matched">Matched</TabsTrigger>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="unmatched">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Bank Amount</TableHead>
                    <TableHead className="text-right">Book Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions
                    .filter(transaction => !reconciledItems.includes(transaction.id))
                    .map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={reconciledItems.includes(transaction.id)}
                            onChange={() => handleReconcileItem(transaction.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.bankAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.bookAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReconcileItem(transaction.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Match
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {bankTransactions.filter(t => !reconciledItems.includes(t.id)).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Check className="h-8 w-8 mb-2 text-green-500" />
                  <p>All transactions have been matched</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="matched">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Bank Amount</TableHead>
                    <TableHead className="text-right">Book Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions
                    .filter(transaction => reconciledItems.includes(transaction.id))
                    .map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={reconciledItems.includes(transaction.id)}
                            onChange={() => handleReconcileItem(transaction.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.bankAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.bookAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReconcileItem(transaction.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Unmatch
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Bank Amount</TableHead>
                    <TableHead className="text-right">Book Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={reconciledItems.includes(transaction.id)}
                          onChange={() => handleReconcileItem(transaction.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.bankAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.bookAmount)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reconciledItems.includes(transaction.id) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reconciledItems.includes(transaction.id) ? 'Matched' : 'Unmatched'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReconcileItem(transaction.id)}
                        >
                          {reconciledItems.includes(transaction.id) ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Unmatch
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Match
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Reconciliation difference:</span> {formatCurrency(0)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button variant="outline">Save & Continue</Button>
              <Button>Complete Reconciliation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankReconciliation;
