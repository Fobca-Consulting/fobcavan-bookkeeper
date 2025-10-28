import { useState, useEffect } from "react";
import { useClientTransactions } from "./useClientTransactions";
import { startOfYear, format } from "date-fns";

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  expenseBreakdown: Array<{ category: string; percentage: number; amount: number }>;
}

export const useClientDashboard = (clientId: string | undefined) => {
  const { transactions, loading } = useClientTransactions(clientId);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    monthlyRevenue: [],
    expenseBreakdown: [],
  });

  useEffect(() => {
    if (!transactions.length) return;

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const netProfit = totalIncome - totalExpense;

    // Calculate monthly revenue for current year
    const currentYear = new Date().getFullYear();
    const monthlyData: Record<string, number> = {};
    
    for (let month = 0; month < 12; month++) {
      const monthName = format(new Date(currentYear, month, 1), 'MMM');
      monthlyData[monthName] = 0;
    }

    transactions
      .filter(t => t.type === 'income' && new Date(t.date).getFullYear() === currentYear)
      .forEach(t => {
        const monthName = format(new Date(t.date), 'MMM');
        monthlyData[monthName] += Number(t.amount);
      });

    const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // Calculate expense breakdown by category
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(Number(t.amount));
      });

    const expenseBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }));

    setStats({
      totalIncome,
      totalExpense,
      netProfit,
      monthlyRevenue,
      expenseBreakdown,
    });
  }, [transactions]);

  return { stats, loading };
};