import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpIcon, 
  DollarSign, 
  CreditCard, 
  Users, 
  ShoppingCart, 
  ChevronUp, 
  ChevronDown, 
  ArrowRight, 
  PlusCircle, 
  Download,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { useClientTransactions } from "@/hooks/useClientTransactions";
import { useClientCustomers } from "@/hooks/useClientCustomers";
import { useClientVendors } from "@/hooks/useClientVendors";
import { CustomerFormDialog } from "@/components/client/CustomerFormDialog";
import { VendorFormDialog } from "@/components/client/VendorFormDialog";
import { TransactionFormDialog } from "@/components/client/TransactionFormDialog";
import { downloadPDF, downloadExcel, formatCurrency } from "@/utils/downloadUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ClientDashboard = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { stats, loading: statsLoading } = useClientDashboard(clientId);
  const { transactions, createTransaction } = useClientTransactions(clientId);
  const { createCustomer } = useClientCustomers(clientId);
  const { createVendor } = useClientVendors(clientId);
  
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const recentTransactions = transactions.slice(0, 5);

  const handleExport = (format: 'pdf' | 'excel') => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const data = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      formatCurrency(t.amount)
    ]);

    if (format === 'pdf') {
      downloadPDF('Transaction Report', headers, data, 'transactions-report');
    } else {
      downloadExcel('Transaction Report', headers, data, 'transactions-report');
    }
  };

  const handleCreateTransaction = async (data: any) => {
    await createTransaction({
      ...data,
      client_id: clientId!,
    });
  };

  const handleCreateCustomer = async (data: any) => {
    await createCustomer({
      ...data,
      client_id: clientId!,
      current_balance: 0,
    });
  };

  const handleCreateVendor = async (data: any) => {
    await createVendor({
      ...data,
      client_id: clientId!,
    });
  };

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" onClick={() => setTransactionDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Financial overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From all income transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From all expense transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Income - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & recent transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Financial Overview - {new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {stats.monthlyRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data for current year
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.expenseBreakdown.length > 0 ? (
                stats.expenseBreakdown.map((item, index) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={item.percentage} 
                        className="h-2 flex-1" 
                        style={{
                          // @ts-ignore
                          '--progress-background': CHART_COLORS[index % CHART_COLORS.length]
                        }}
                      />
                      <span className="text-xs text-muted-foreground min-w-[80px] text-right">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recent transactions
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Button 
              className="w-full justify-start h-8 text-xs px-2" 
              variant="outline"
              onClick={() => setTransactionDialogOpen(true)}
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Add Transaction</span>
            </Button>
            <Button 
              className="w-full justify-start h-8 text-xs px-2" 
              variant="outline"
              onClick={() => setCustomerDialogOpen(true)}
            >
              <Users className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Add Customer</span>
            </Button>
            <Button 
              className="w-full justify-start h-8 text-xs px-2" 
              variant="outline"
              onClick={() => setVendorDialogOpen(true)}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Add Vendor</span>
            </Button>
            <Button 
              className="w-full justify-start h-8 text-xs px-2" 
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              <Download className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Generate Report</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <CustomerFormDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSave={handleCreateCustomer}
      />

      <VendorFormDialog
        open={vendorDialogOpen}
        onOpenChange={setVendorDialogOpen}
        onSave={handleCreateVendor}
      />

      <TransactionFormDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onSave={handleCreateTransaction}
      />
    </div>
  );
};

export default ClientDashboard;
