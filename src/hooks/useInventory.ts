import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface StockMovement {
  id: number;
  itemId: number;
  itemName: string;
  type: 'purchase' | 'sale' | 'adjustment';
  quantity: number;
  unitPrice: number;
  reference: string;
  date: string;
  notes?: string;
}

// Mock initial inventory - products only, not assets
const initialInventory: InventoryItem[] = [
  {
    id: 1,
    code: "PROD-001",
    name: "Premium Widget",
    category: "Electronics",
    quantity: 50,
    unitPrice: 25.99,
    totalValue: 1299.50,
    status: "in-stock"
  },
  {
    id: 2,
    code: "PROD-002", 
    name: "Standard Widget",
    category: "Electronics",
    quantity: 5,
    unitPrice: 15.99,
    totalValue: 79.95,
    status: "low-stock"
  },
  {
    id: 3,
    code: "PROD-003",
    name: "Digital Service Package",
    category: "Services",
    quantity: 100,
    unitPrice: 49.99,
    totalValue: 4999.00,
    status: "in-stock"
  },
  {
    id: 4,
    code: "PROD-004",
    name: "Software License",
    category: "Software",
    quantity: 0,
    unitPrice: 199.99,
    totalValue: 0,
    status: "out-of-stock"
  }
];

const initialMovements: StockMovement[] = [
  {
    id: 1,
    itemId: 1,
    itemName: "Premium Widget",
    type: "purchase",
    quantity: 50,
    unitPrice: 20.00,
    reference: "PO-001",
    date: "2024-01-15",
    notes: "Initial stock purchase"
  },
  {
    id: 2,
    itemId: 1,
    itemName: "Premium Widget", 
    type: "sale",
    quantity: -10,
    unitPrice: 25.99,
    reference: "INV-001",
    date: "2024-01-20",
    notes: "Sale to customer"
  }
];

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);

  const updateItemStatus = (item: InventoryItem): InventoryItem => {
    let status: 'in-stock' | 'low-stock' | 'out-of-stock';
    
    if (item.quantity === 0) {
      status = 'out-of-stock';
    } else if (item.quantity <= 10) {
      status = 'low-stock';
    } else {
      status = 'in-stock';
    }
    
    return { ...item, status, totalValue: item.quantity * item.unitPrice };
  };

  const processStockMovement = (movement: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: movements.length + 1,
    };

    // Update inventory
    setInventory(prev => prev.map(item => {
      if (item.id === movement.itemId) {
        const newQuantity = item.quantity + movement.quantity;
        const updatedItem = { ...item, quantity: Math.max(0, newQuantity) };
        return updateItemStatus(updatedItem);
      }
      return item;
    }));

    // Add movement record
    setMovements(prev => [...prev, newMovement]);

    toast({
      title: "Stock Updated",
      description: `${movement.type === 'purchase' ? 'Added' : 'Removed'} ${Math.abs(movement.quantity)} units of ${movement.itemName}`,
    });
  };

  const recordPurchase = (itemId: number, quantity: number, unitPrice: number, reference: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    processStockMovement({
      itemId,
      itemName: item.name,
      type: 'purchase',
      quantity: Math.abs(quantity), // Ensure positive for purchases
      unitPrice,
      reference,
      date: new Date().toISOString().split('T')[0],
      notes: `Purchase from vendor - ${reference}`
    });
  };

  const recordSale = (itemId: number, quantity: number, unitPrice: number, reference: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (item.quantity < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.quantity} units available for ${item.name}`,
        variant: "destructive"
      });
      return false;
    }

    processStockMovement({
      itemId,
      itemName: item.name,
      type: 'sale',
      quantity: -Math.abs(quantity), // Ensure negative for sales
      unitPrice,
      reference,
      date: new Date().toISOString().split('T')[0],
      notes: `Sale to customer - ${reference}`
    });

    return true;
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
    
    return { totalItems, totalValue, lowStockItems };
  };

  return {
    inventory,
    movements,
    recordPurchase,
    recordSale,
    getInventoryStats,
    processStockMovement
  };
};

export default useInventory;