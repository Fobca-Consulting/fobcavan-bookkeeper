import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  client_id: string;
  date: string;
  description: string;
  category: string;
  account: string;
  bank_ledger?: string;
  reference: string;
  amount: number;
  type: "income" | "expense";
  status: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

interface AccountingPeriod {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: string;
}

export const useClientTransactions = (clientId: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClosedPeriods = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'closed');

      if (error) throw error;
      setClosedPeriods((data || []) as AccountingPeriod[]);
    } catch (error: any) {
      console.error('Error fetching closed periods:', error);
    }
  };

  const isTransactionInClosedPeriod = useCallback((date: string): boolean => {
    const txDate = new Date(date);
    return closedPeriods.some(period => {
      const start = new Date(period.period_start);
      const end = new Date(period.period_end);
      return txDate >= start && txDate <= end;
    });
  }, [closedPeriods]);

  const fetchTransactions = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    // Check if the transaction date falls in a closed period
    if (isTransactionInClosedPeriod(transactionData.date)) {
      toast({
        title: "Cannot Create Transaction",
        description: "This transaction date falls within a closed accounting period. Transactions in closed periods are read-only.",
        variant: "destructive",
      });
      return { data: null, error: new Error("Period is closed") };
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      
      fetchTransactions();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    // Find the transaction to check its date
    const transaction = transactions.find(t => t.id === id);
    if (transaction && isTransactionInClosedPeriod(transaction.date)) {
      toast({
        title: "Cannot Update Transaction",
        description: "This transaction is in a closed accounting period and cannot be modified.",
        variant: "destructive",
      });
      return;
    }

    // Also check if the new date (if being updated) falls in a closed period
    if (updates.date && isTransactionInClosedPeriod(updates.date)) {
      toast({
        title: "Cannot Update Transaction",
        description: "Cannot move transaction to a closed accounting period.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      
      fetchTransactions();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    // Find the transaction to check its date
    const transaction = transactions.find(t => t.id === id);
    if (transaction && isTransactionInClosedPeriod(transaction.date)) {
      toast({
        title: "Cannot Delete Transaction",
        description: "This transaction is in a closed accounting period and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      
      fetchTransactions();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchClosedPeriods();

    // Set up real-time subscription
    const channel = supabase
      .channel('client-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    isTransactionInClosedPeriod,
  };
};
