import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, TrendingUp, TrendingDown, AlertTriangle, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadPDF, downloadExcel, formatCurrency } from "@/utils/downloadUtils";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  supplier: string;
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  unitPrice: number;
  reference: string;
  date: string;
  notes: string;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    code: "ITM-001",
    name: "Office Desk",
    category: "Furniture",
    quantity: 15,
    unitPrice: 299.99,
    totalValue: 4499.85,
    reorderLevel: 5,
    supplier: "Office Supplies Co.",
    lastUpdated: "2024-01-15",
    status: "in-stock"
  },
  {
    id: "2",
    code: "ITM-002",
    name: "Computer Monitor",
    category: "Electronics",
    quantity: 3,
    unitPrice: 249.99,
    totalValue: 749.97,
    reorderLevel: 5,
    supplier: "Tech Solutions Ltd.",
    lastUpdated: "2024-01-14",
    status: "low-stock"
  },
  {
    id: "3",
    code: "ITM-003",
    name: "Office Chair",
    category: "Furniture",
    quantity: 0,
    unitPrice: 159.99,
    totalValue: 0,
    reorderLevel: 3,
    supplier: "Furniture World",
    lastUpdated: "2024-01-13",
    status: "out-of-stock"
  }
];

const mockStockMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Office Desk",
    type: "in",
    quantity: 10,
    unitPrice: 299.99,
    reference: "PO-001",
    date: "2024-01-15",
    notes: "Initial stock purchase"
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Computer Monitor",
    type: "out",
    quantity: 2,
    unitPrice: 249.99,
    reference: "SO-001",
    date: "2024-01-14",
    notes: "Sale to customer"
  }
];

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(mockStockMovements);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "adjustment":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === "low-stock" || item.status === "out-of-stock").length;

  const downloadInventoryPDF = () => {
    const headers = ["Code", "Name", "Category", "Quantity", "Unit Price", "Total Value", "Status"];
    const data = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalValue),
      item.status
    ]);
    downloadPDF("Inventory Report", headers, data, "inventory-report");
  };

  const downloadInventoryExcel = () => {
    const headers = ["Code", "Name", "Category", "Quantity", "Unit Price", "Total Value", "Reorder Level", "Supplier", "Status"];
    const data = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.quantity,
      item.unitPrice,
      item.totalValue,
      item.reorderLevel,
      item.supplier,
      item.status
    ]);
    downloadExcel("Inventory Report", headers, data, "inventory-report");
  };

  const downloadMovementsPDF = () => {
    const headers = ["Date", "Item", "Type", "Quantity", "Unit Price", "Reference", "Notes"];
    const data = stockMovements.map(movement => [
      movement.date,
      movement.itemName,
      movement.type,
      movement.quantity.toString(),
      formatCurrency(movement.unitPrice),
      movement.reference,
      movement.notes
    ]);
    downloadPDF("Stock Movement Report", headers, data, "stock-movements");
  };

  const downloadMovementsExcel = () => {
    const headers = ["Date", "Item", "Type", "Quantity", "Unit Price", "Reference", "Notes"];
    const data = stockMovements.map(movement => [
      movement.date,
      movement.itemName,
      movement.type,
      movement.quantity,
      movement.unitPrice,
      movement.reference,
      movement.notes
    ]);
    downloadExcel("Stock Movement Report", headers, data, "stock-movements");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{inventoryItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Inventory Items
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadInventoryPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadInventoryExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Stock Movements
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadMovementsPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadMovementsExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Movement
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.itemName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getMovementIcon(movement.type)}
                          <span className="ml-2 capitalize">{movement.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{formatCurrency(movement.unitPrice)}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell>{movement.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;