import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  credit_limit: number;
  current_balance: number;
  payment_terms_days: number;
  tax_exempt: boolean;
  discount_percentage: number;
  customer_type: 'regular' | 'wholesale' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface CustomerCommunication {
  id: string;
  customer_id: string;
  communication_type: 'email' | 'phone' | 'meeting' | 'note' | 'follow_up';
  subject?: string;
  content: string;
  scheduled_date?: string;
  completed_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_by?: string;
  created_at: string;
}

export interface CustomerStatement {
  id: string;
  customer_id: string;
  statement_date: string;
  from_date: string;
  to_date: string;
  opening_balance: number;
  closing_balance: number;
  total_charges: number;
  total_payments: number;
  status: 'draft' | 'sent' | 'paid';
  sent_at?: string;
  created_at: string;
}

export interface AgingReport {
  customer_id: string;
  customer_name: string;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
  total_due: number;
}

export const useAdvancedCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [statements, setStatements] = useState<CustomerStatement[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers((data || []) as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  // Fetch customer communications
  const fetchCommunications = async (customerId?: string) => {
    try {
      let query = supabase
        .from('customer_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCommunications((data || []) as CustomerCommunication[]);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communications",
        variant: "destructive",
      });
    }
  };

  // Fetch customer statements
  const fetchStatements = async (customerId?: string) => {
    try {
      let query = supabase
        .from('customer_statements')
        .select('*')
        .order('statement_date', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStatements((data || []) as CustomerStatement[]);
    } catch (error) {
      console.error('Error fetching statements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch statements",
        variant: "destructive",
      });
    }
  };

  // Create customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [...prev, data as Customer]);
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update customer
  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => prev.map(c => c.id === id ? data as Customer : c));
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add communication
  const addCommunication = async (communicationData: Omit<CustomerCommunication, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_communications')
        .insert([communicationData])
        .select()
        .single();

      if (error) throw error;

      setCommunications(prev => [data as CustomerCommunication, ...prev]);
      toast({
        title: "Success",
        description: "Communication logged successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding communication:', error);
      toast({
        title: "Error",
        description: "Failed to log communication",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Generate customer statement
  const generateStatement = async (customerId: string, fromDate: string, toDate: string) => {
    try {
      setLoading(true);
      
      // This would typically calculate from invoice and payment data
      // For now, we'll create a mock statement
      const statementData = {
        customer_id: customerId,
        statement_date: new Date().toISOString().split('T')[0],
        from_date: fromDate,
        to_date: toDate,
        opening_balance: 0,
        closing_balance: 0,
        total_charges: 0,
        total_payments: 0,
        status: 'draft' as const,
      };

      const { data, error } = await supabase
        .from('customer_statements')
        .insert([statementData])
        .select()
        .single();

      if (error) throw error;

      setStatements(prev => [data as CustomerStatement, ...prev]);
      toast({
        title: "Success",
        description: "Customer statement generated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error generating statement:', error);
      toast({
        title: "Error",
        description: "Failed to generate statement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check credit limit
  const checkCreditLimit = (customer: Customer, additionalAmount: number = 0) => {
    const totalOwed = customer.current_balance + additionalAmount;
    return {
      withinLimit: totalOwed <= customer.credit_limit,
      currentBalance: customer.current_balance,
      creditLimit: customer.credit_limit,
      availableCredit: customer.credit_limit - customer.current_balance,
      wouldExceed: totalOwed > customer.credit_limit,
      exceedAmount: Math.max(0, totalOwed - customer.credit_limit),
    };
  };

  // Get customers requiring follow-up
  const getFollowUpCustomers = () => {
    return customers.filter(customer => {
      const creditCheck = checkCreditLimit(customer);
      return !creditCheck.withinLimit || customer.status === 'suspended';
    });
  };

  // Get aging report data (mock implementation)
  const getAgingReport = (): AgingReport[] => {
    return customers.map(customer => ({
      customer_id: customer.id,
      customer_name: customer.name,
      current: Math.random() * 5000,
      days_30: Math.random() * 3000,
      days_60: Math.random() * 2000,
      days_90: Math.random() * 1000,
      over_90: Math.random() * 500,
      total_due: customer.current_balance,
    }));
  };

  useEffect(() => {
    fetchCustomers();
    fetchCommunications();
    fetchStatements();
  }, []);

  return {
    customers,
    communications,
    statements,
    loading,
    createCustomer,
    updateCustomer,
    addCommunication,
    generateStatement,
    checkCreditLimit,
    getFollowUpCustomers,
    getAgingReport,
    fetchCustomers,
    fetchCommunications,
    fetchStatements,
  };
};