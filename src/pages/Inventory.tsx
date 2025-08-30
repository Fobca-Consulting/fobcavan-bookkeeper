import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Package2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { downloadPDF, downloadExcel } from "@/utils/downloadUtils";
import { useInventory, InventoryItem, StockMovement } from "@/hooks/useInventory";

const Inventory = () => {
  const { inventory, movements, getInventoryStats } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge variant="warning">
            <AlertCircle className="w-3 h-3 mr-1" />
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "sale":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Package2 className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get stats from the hook
  const { totalItems, totalValue, lowStockItems } = getInventoryStats();

  // Download functions  
  const downloadInventoryPDF = () => {
    const headers = ["Code", "Product Name", "Category", "Quantity", "Unit Price", "Total Value", "Status"];
    const data = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalValue),
      item.status
    ]);
    
    downloadPDF("Product Inventory", "inventory-report", headers, data);
  };

  const downloadInventoryExcel = () => {
    const headers = ["Code", "Product Name", "Category", "Quantity", "Unit Price", "Total Value", "Status"];
    const data = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.quantity,
      item.unitPrice,
      item.totalValue,
      item.status
    ]);
    
    downloadExcel("Product Inventory", "inventory-report", headers, data);
  };

  const downloadMovementsPDF = () => {
    const headers = ["Date", "Product", "Type", "Quantity", "Unit Price", "Reference", "Notes"];
    const data = movements.map(movement => [
      movement.date,
      movement.itemName,
      movement.type,
      Math.abs(movement.quantity).toString(),
      formatCurrency(movement.unitPrice),
      movement.reference,
      movement.notes || ""
    ]);
    
    downloadPDF("Stock Movements", "stock-movements", headers, data);
  };

  const downloadMovementsExcel = () => {
    const headers = ["Date", "Product", "Type", "Quantity", "Unit Price", "Reference", "Notes"];
    const data = movements.map(movement => [
      movement.date,
      movement.itemName,
      movement.type,
      Math.abs(movement.quantity),
      movement.unitPrice,
      movement.reference,
      movement.notes || ""
    ]);
    
    downloadExcel("Stock Movements", "stock-movements", headers, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Inventory</h1>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Active products in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Products requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name or code..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Products and Movements */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Product Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Inventory
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
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                          Add a new product to your inventory system.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Form content would go here */}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Product Name</TableHead>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.itemName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getMovementIcon(movement.type)}
                          <span className="ml-2 capitalize">{movement.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{Math.abs(movement.quantity)}</TableCell>
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