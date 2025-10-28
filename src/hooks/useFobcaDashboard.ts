import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  clientGrowth: number;
  revenueGrowth: number;
  directClients: number;
  indirectClients: number;
  directRevenue: number;
  indirectRevenue: number;
  monthlyRevenueByMonth: { month: string; revenue: number }[];
}

export const useFobcaDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    clientGrowth: 0,
    revenueGrowth: 0,
    directClients: 0,
    indirectClients: 0,
    directRevenue: 0,
    indirectRevenue: 0,
    monthlyRevenueByMonth: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const currentMonthDate = new Date(currentYear, currentMonth, 1);

      // Fetch all clients
      const { data: allClients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Calculate active clients (those who accessed system in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeClients = allClients?.filter(client => 
        client.last_active && new Date(client.last_active) >= thirtyDaysAgo
      ).length || 0;

      // Count clients by type
      const directClients = allClients?.filter(c => c.client_type === 'direct').length || 0;
      const indirectClients = allClients?.filter(c => c.client_type === 'indirect').length || 0;

      // Fetch all revenue
      const { data: allRevenue, error: revenueError } = await supabase
        .from('client_revenue')
        .select('*');

      if (revenueError) throw revenueError;

      const totalRevenue = allRevenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Calculate monthly revenue (current month)
      const monthlyRevenue = allRevenue?.filter(r => {
        const revenueDate = new Date(r.revenue_date);
        return revenueDate >= currentMonthDate;
      }).reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      // Calculate last month's revenue for growth
      const lastMonthRevenue = allRevenue?.filter(r => {
        const revenueDate = new Date(r.revenue_date);
        return revenueDate >= lastMonthDate && revenueDate < currentMonthDate;
      }).reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Calculate revenue by client type
      const { data: clientsWithRevenue } = await supabase
        .from('client_revenue')
        .select('client_id, amount');

      let directRevenue = 0;
      let indirectRevenue = 0;

      if (clientsWithRevenue) {
        for (const rev of clientsWithRevenue) {
          const client = allClients?.find(c => c.id === rev.client_id);
          if (client) {
            if (client.client_type === 'direct') {
              directRevenue += Number(rev.amount);
            } else {
              indirectRevenue += Number(rev.amount);
            }
          }
        }
      }

      // Calculate monthly revenue for past 12 months
      const monthlyRevenueByMonth: { month: string; revenue: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);
        
        const revenue = allRevenue?.filter(r => {
          const revenueDate = new Date(r.revenue_date);
          return revenueDate >= monthDate && revenueDate < nextMonthDate;
        }).reduce((sum, r) => sum + Number(r.amount), 0) || 0;

        monthlyRevenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          revenue
        });
      }

      // Calculate client growth (comparing last month to previous month)
      const lastMonthClients = allClients?.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate < currentMonthDate;
      }).length || 0;

      const currentMonthClients = allClients?.length || 0;
      const clientGrowth = lastMonthClients > 0 
        ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100 
        : 0;

      setStats({
        totalClients: allClients?.length || 0,
        activeClients,
        totalRevenue,
        monthlyRevenue,
        clientGrowth,
        revenueGrowth,
        directClients,
        indirectClients,
        directRevenue,
        indirectRevenue,
        monthlyRevenueByMonth
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Subscribe to realtime updates
    const clientsChannel = supabase
      .channel('dashboard-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const revenueChannel = supabase
      .channel('dashboard-revenue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_revenue' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(revenueChannel);
    };
  }, []);

  return { stats, loading, refetch: fetchDashboardStats };
};
