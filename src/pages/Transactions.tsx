
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
import { 
  ChevronDown, 
  PlusCircle, 
  FileText, 
  Download, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  ChevronUp, 
  Search, 
  Edit,
  Eye,
  Trash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionDetails } from "@/components/transactions/transaction-details";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Define a type for transaction data
interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  account: string;
  reference: string;
  amount: number;
  type: string;
  status: string;
  details?: string;
  attachments?: string[];
}

const transactionData: Transaction[] = [
  { 
    id: 1, 
    date: "2023-05-15", 
    description: "Sales Revenue", 
    category: "Revenue",
    account: "Sales", 
    reference: "INV-001",
    amount: 2500, 
    type: "income", 
    status: "completed",
    details: "Monthly sales revenue",
    attachments: []
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
    status: "completed",
    details: "Printer paper and ink cartridges",
    attachments: []
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
    status: "completed",
    details: "Payment for project completion",
    attachments: []
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
    status: "completed",
    details: "Electricity and water bill",
    attachments: []
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
    status: "completed",
    details: "Monthly office rent",
    attachments: []
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
    status: "completed",
    details: "Monthly subscription for design software",
    attachments: []
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
    status: "completed",
    details: "Product sales for the week",
    attachments: []
  }
];

const Transactions = () => {
  const [transactions, setTransactions] = useState(transactionData);
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const handleAddTransaction = (data: any, images: File[]) => {
    const newTransaction = {
      id: transactions.length + 1,
      date: data.date.toISOString().split('T')[0],
      description: data.description,
      category: data.category,
      account: data.account,
      reference: data.reference,
      amount: data.category === "Expense" ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount)),
      type: data.category === "Expense" ? "expense" : "income",
      status: "completed",
      details: data.details,
      attachments: images.map(img => img.name),
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast({
      title: "Transaction Added",
      description: "Your transaction has been added successfully.",
    });
  };
  
  const handleUpdateTransaction = (data: any, images: File[]) => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === selectedTransaction.id 
        ? {
            ...transaction,
            date: data.date.toISOString().split('T')[0],
            description: data.description,
            category: data.category,
            account: data.account,
            reference: data.reference,
            amount: data.category === "Expense" ? -Math.abs(Number(data.amount)) : Math.abs(Number(data.amount)),
            type: data.category === "Expense" ? "expense" : "income",
            details: data.details,
            attachments: [...(transaction.attachments || []), ...images.map(img => img.name)],
          }
        : transaction
    );
    
    setTransactions(updatedTransactions);
    toast({
      title: "Transaction Updated",
      description: "Your transaction has been updated successfully.",
    });
  };
  
  const handleDeleteTransaction = () => {
    if (!selectedTransaction) return;
    
    const filteredTransactions = transactions.filter(
      transaction => transaction.id !== selectedTransaction.id
    );
    
    setTransactions(filteredTransactions);
    setDeleteDialogOpen(false);
    setDetailsOpen(false);
    toast({
      title: "Transaction Deleted",
      description: "Your transaction has been deleted successfully.",
    });
  };
  
  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };
  
  const editTransaction = () => {
    setDetailsOpen(false);
    setEditTransactionOpen(true);
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === "all") return true;
    if (activeTab === "income") return transaction.type === "income";
    if (activeTab === "expense") return transaction.type === "expense";
    if (activeTab === "pending") return transaction.status === "pending";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setNewTransactionOpen(true)}>
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-[180px]">
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
              <div className="w-full md:w-[180px]">
                <DatePicker 
                  date={startDate} 
                  setDate={setStartDate} 
                  placeholder="Start Date"
                />
              </div>
              <div className="w-full md:w-[180px]">
                <DatePicker 
                  date={endDate} 
                  setDate={setEndDate} 
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => viewTransactionDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setEditTransactionOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No transactions found. Create a new transaction to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="income">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => viewTransactionDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setEditTransactionOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No income transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="expense">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => viewTransactionDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setEditTransactionOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No expense transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No pending transactions found
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={true}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={true}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TransactionForm 
        open={newTransactionOpen}
        onOpenChange={setNewTransactionOpen}
        onSave={handleAddTransaction}
        dialogTitle="Add New Transaction"
        dialogDescription="Enter the details for the new transaction."
        submitButtonText="Add Transaction"
      />

      <TransactionForm 
        open={editTransactionOpen}
        onOpenChange={setEditTransactionOpen}
        transaction={selectedTransaction}
        onSave={handleUpdateTransaction}
        dialogTitle="Edit Transaction"
        dialogDescription="Update the transaction details."
        submitButtonText="Update Transaction"
      />

      {selectedTransaction && (
        <TransactionDetails 
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          transaction={selectedTransaction}
          onEdit={editTransaction}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      )}

      <ConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTransaction}
        variant="destructive"
      />
    </div>
  );
};

export default Transactions;
