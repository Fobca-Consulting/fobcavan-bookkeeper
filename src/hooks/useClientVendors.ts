import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Vendor {
  id: string;
  client_id: string;
  vendor_code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  vendor_type?: string;
  status?: string;
  payment_terms_days?: number;
  created_at?: string;
  updated_at?: string;
}

export const useClientVendors = (clientId: string | undefined) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('client_id', clientId)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
      
      fetchVendors();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      
      fetchVendors();
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor",
        variant: "destructive",
      });
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      
      fetchVendors();
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVendors();

    // Set up real-time subscription
    const channel = supabase
      .channel('client-vendors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchVendors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return {
    vendors,
    loading,
    createVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors,
  };
};