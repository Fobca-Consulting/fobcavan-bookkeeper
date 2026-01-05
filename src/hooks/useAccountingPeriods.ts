import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AccountingPeriod {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: "open" | "closed";
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAccountingPeriods = (clientId: string | undefined) => {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeriods = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .select('*')
        .eq('client_id', clientId)
        .order('period_start', { ascending: false });

      if (error) throw error;
      setPeriods((data || []) as AccountingPeriod[]);
    } catch (error: any) {
      console.error('Error fetching accounting periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateInClosedPeriod = (date: string): boolean => {
    const txDate = new Date(date);
    return periods.some(period => {
      if (period.status !== 'closed') return false;
      const start = new Date(period.period_start);
      const end = new Date(period.period_end);
      return txDate >= start && txDate <= end;
    });
  };

  const closePeriod = async (periodStart: string, periodEnd: string, notes?: string) => {
    if (!clientId) return { error: new Error("No client ID") };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('accounting_periods')
        .upsert({
          client_id: clientId,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
          notes
        }, {
          onConflict: 'client_id,period_start,period_end'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Period Closed",
        description: `Accounting period ${periodStart} to ${periodEnd} has been closed. Transactions in this period are now read-only.`,
      });
      
      fetchPeriods();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error closing period:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to close accounting period",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [clientId]);

  return {
    periods,
    loading,
    isDateInClosedPeriod,
    closePeriod,
    refetch: fetchPeriods,
  };
};
