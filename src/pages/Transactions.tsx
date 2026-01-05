import React, { useState, useMemo } from "react";
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
  Trash,
  Lock
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
import { useParams } from "react-router-dom";
import { useClientTransactions } from "@/hooks/useClientTransactions";
import { downloadPDF, downloadExcel } from "@/utils/downloadUtils";

const Transactions = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction, isTransactionInClosedPeriod } = useClientTransactions(clientId);
  
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const handleAddTransaction = async (data: any, images: File[]) => {
    await createTransaction({
      client_id: clientId!,
      date: data.date.toISOString().split('T')[0],
      description: data.description,
      category: data.category,
      account: data.account,
      reference: data.reference,
      amount: Math.abs(Number(data.amount)),
      type: data.category === "Expense" ? "expense" : "income",
      status: "completed",
      details: data.details,
    });
    setNewTransactionOpen(false);
  };
  
  const handleUpdateTransaction = async (data: any, images: File[]) => {
    if (!selectedTransaction) return;
    
    await updateTransaction(selectedTransaction.id, {
      date: data.date.toISOString().split('T')[0],
      description: data.description,
      category: data.category,
      account: data.account,
      reference: data.reference,
      amount: Math.abs(Number(data.amount)),
      type: data.category === "Expense" ? "expense" : "income",
      details: data.details,
    });
    setEditTransactionOpen(false);
  };
  
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    await deleteTransaction(selectedTransaction.id);
    setDeleteDialogOpen(false);
    setDetailsOpen(false);
  };
  
  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };
  
  const editTransactionHandler = () => {
    setDetailsOpen(false);
    setEditTransactionOpen(true);
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by tab
      if (activeTab === "income" && transaction.type !== "income") return false;
      if (activeTab === "expense" && transaction.type !== "expense") return false;
      if (activeTab === "pending" && transaction.status !== "pending") return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          transaction.description?.toLowerCase().includes(query) ||
          transaction.category?.toLowerCase().includes(query) ||
          transaction.account?.toLowerCase().includes(query) ||
          transaction.reference?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Filter by date range
      if (startDate) {
        const txDate = new Date(transaction.date);
        if (txDate < startDate) return false;
      }
      if (endDate) {
        const txDate = new Date(transaction.date);
        if (txDate > endDate) return false;
      }
      
      return true;
    });
  }, [transactions, activeTab, searchQuery, startDate, endDate]);

  const handleExport = (format: 'pdf' | 'excel', scope: 'current' | 'all') => {
    const dataToExport = scope === 'current' ? filteredTransactions : transactions;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no transactions to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Account', 'Reference', 'Type', 'Amount'];
    const data = dataToExport.map(t => [
      t.date,
      t.description,
      t.category,
      t.account,
      t.reference,
      t.type,
      formatCurrency(t.amount)
    ]);

    const filename = `transactions-${scope}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'pdf') {
      downloadPDF('Transaction Report', headers, data, filename);
    } else {
      downloadExcel('Transaction Report', headers, data, filename);
    }

    toast({
      title: "Export successful",
      description: `Transactions exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel', 'current')}>
                Export Current View (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'current')}>
                Export Current View (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel', 'all')}>
                Export All Transactions (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'all')}>
                Export All Transactions (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-muted-foreground">Loading transactions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => {
                      const isLocked = isTransactionInClosedPeriod(transaction.date);
                      return (
                        <TableRow key={transaction.id} className={isLocked ? 'bg-muted/50' : ''}>
                          <TableCell className="flex items-center gap-2">
                            {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {transaction.date}
                          </TableCell>
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
                              {!isLocked && (
                                <>
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
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {searchQuery || startDate || endDate 
                          ? "No transactions found matching your filters." 
                          : "No transactions found. Create a new transaction to get started."}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-muted-foreground">Loading transactions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
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
                        {searchQuery || startDate || endDate 
                          ? "No income transactions found matching your filters." 
                          : "No income transactions found."}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-muted-foreground">Loading transactions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
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
                        {searchQuery || startDate || endDate 
                          ? "No expense transactions found matching your filters." 
                          : "No expense transactions found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="pending">
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3 text-muted-foreground">Loading transactions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
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
                        {searchQuery || startDate || endDate 
                          ? "No pending transactions found matching your filters." 
                          : "No pending transactions found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
          onEdit={editTransactionHandler}
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
