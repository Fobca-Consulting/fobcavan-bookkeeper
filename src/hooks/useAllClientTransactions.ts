import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface TransactionWithClient {
  id: string;
  client_id: string;
  client_name?: string;
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

export const useAllClientTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTransactions = async () => {
    try {
      // First fetch all clients the admin can see
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, business_name');

      if (clientsError) throw clientsError;

      // Create a map of client IDs to names
      const clientMap = new Map<string, string>();
      clients?.forEach(client => {
        clientMap.set(client.id, client.business_name);
      });

      // Fetch all transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Merge client names with transactions
      const enrichedTransactions: TransactionWithClient[] = (transactionsData || []).map(tx => ({
        ...tx,
        type: tx.type as "income" | "expense",
        client_name: clientMap.get(tx.client_id) || 'Unknown Client'
      }));

      setTransactions(enrichedTransactions);
    } catch (error: any) {
      console.error('Error fetching all transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();

    // Set up real-time subscription for all transactions
    const channel = supabase
      .channel('all-client-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        () => {
          fetchAllTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    loading,
    refetch: fetchAllTransactions,
  };
};
