import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface InventoryLocation {
  id: string;
  name: string;
  address?: string;
  description?: string;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description?: string;
  category?: string;
  unit_of_measure: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  reorder_quantity: number;
  track_serials: boolean;
  track_lots: boolean;
  expiry_tracking: boolean;
  active: boolean;
}

export interface InventoryStock {
  id: string;
  item_id: string;
  location_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  item?: InventoryItem;
  location?: InventoryLocation;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id?: string;
  location_id: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  item_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  item?: InventoryItem;
}

export const useAdvancedInventory = () => {
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stock, setStock] = useState<InventoryStock[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory locations",
        variant: "destructive",
      });
    }
  };

  // Fetch items
  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    }
  };

  // Fetch stock levels
  const fetchStock = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_stock')
        .select(`
          *,
          item:inventory_items(*),
          location:inventory_locations(*)
        `)
        .order('quantity_available');

      if (error) throw error;
      setStock(data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock levels",
        variant: "destructive",
      });
    }
  };

  // Fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          items:purchase_order_items(
            *,
            item:inventory_items(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders((data || []) as PurchaseOrder[]);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase orders",
        variant: "destructive",
      });
    }
  };

  // Create inventory item
  const createItem = async (itemData: Omit<InventoryItem, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "Error",
        description: "Failed to create inventory item",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create purchase order
  const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id'>, items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[]) => {
    try {
      setLoading(true);
      
      // Create the purchase order
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create purchase order items
      const orderItems = items.map(item => ({
        ...item,
        po_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await fetchPurchaseOrders();
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      return order;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update stock levels
  const updateStock = async (itemId: string, locationId: string, quantity: number, type: 'receive' | 'issue' | 'adjust') => {
    try {
      setLoading(true);
      
      // Get current stock
      const { data: currentStock, error: stockError } = await supabase
        .from('inventory_stock')
        .select('*')
        .eq('item_id', itemId)
        .eq('location_id', locationId)
        .single();

      if (stockError && stockError.code !== 'PGRST116') throw stockError;

      let newQuantity = quantity;
      if (currentStock) {
        switch (type) {
          case 'receive':
            newQuantity = currentStock.quantity_on_hand + quantity;
            break;
          case 'issue':
            newQuantity = currentStock.quantity_on_hand - quantity;
            break;
          case 'adjust':
            newQuantity = quantity;
            break;
        }
      }

      const stockData = {
        item_id: itemId,
        location_id: locationId,
        quantity_on_hand: newQuantity,
        last_updated: new Date().toISOString(),
      };

      let result;
      if (currentStock) {
        const { data, error } = await supabase
          .from('inventory_stock')
          .update({ 
            quantity_on_hand: newQuantity,
            last_updated: new Date().toISOString(),
          })
          .eq('id', currentStock.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('inventory_stock')
          .insert([stockData])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      await fetchStock();
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
      return result;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get low stock items (below reorder level)
  const getLowStockItems = () => {
    return stock.filter(s => 
      s.item && 
      s.item.reorder_level > 0 && 
      s.quantity_available <= s.item.reorder_level
    );
  };

  // Get items that need reordering
  const getReorderSuggestions = () => {
    return getLowStockItems().map(s => ({
      item: s.item!,
      current_stock: s.quantity_available,
      suggested_quantity: s.item!.reorder_quantity || 100,
    }));
  };

  useEffect(() => {
    fetchLocations();
    fetchItems();
    fetchStock();
    fetchPurchaseOrders();
  }, []);

  return {
    locations,
    items,
    stock,
    purchaseOrders,
    loading,
    createItem,
    createPurchaseOrder,
    updateStock,
    getLowStockItems,
    getReorderSuggestions,
    fetchLocations,
    fetchItems,
    fetchStock,
    fetchPurchaseOrders,
  };
};