
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Eye, 
  Filter, 
  PlusCircle, 
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Mock vendors data
const vendors = [
  {
    id: 1,
    name: "Tech Supplies Inc.",
    contactName: "Mark Johnson",
    email: "mark@techsupplies.com",
    phone: "+1 (555) 123-7890",
    status: "active",
    balance: 2500.00,
    currency: "USD",
    lastPayment: "2023-05-18",
  },
  {
    id: 2,
    name: "Office Solutions Ltd.",
    contactName: "Sarah Williams",
    email: "sarah@officesolutions.com",
    phone: "+1 (555) 456-7890",
    status: "active",
    balance: 1750.25,
    currency: "USD",
    lastPayment: "2023-05-10",
  },
  {
    id: 3,
    name: "Global Shipping Co.",
    contactName: "Michael Brown",
    email: "michael@globalshipping.com",
    phone: "+1 (555) 789-1234",
    status: "inactive",
    balance: 0,
    currency: "USD",
    lastPayment: "2023-03-15",
  },
  {
    id: 4,
    name: "Premium Services Group",
    contactName: "Lisa Miller",
    email: "lisa@premiumservices.com",
    phone: "+1 (555) 222-3333",
    status: "active",
    balance: 5300.75,
    currency: "USD",
    lastPayment: "2023-05-22",
  },
  {
    id: 5,
    name: "Facilities Management Inc.",
    contactName: "David Wilson",
    email: "david@facilitiesmanagement.com",
    phone: "+1 (555) 444-5555",
    status: "pending",
    balance: 3200.50,
    currency: "USD",
    lastPayment: "2023-05-05",
  },
];

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filter vendors based on search query and status filter
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button>
          <Briefcase className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Vendor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="all">All Vendors</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search vendors..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{vendor.contactName}</span>
                          <span className="text-sm text-muted-foreground">{vendor.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          vendor.status === "active" ? "success" : 
                          vendor.status === "pending" ? "warning" : "secondary"
                        }>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(vendor.balance, vendor.currency)}
                      </TableCell>
                      <TableCell>{vendor.lastPayment}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredVendors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-2">No vendors found</p>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Vendor
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              {/* This will be similar to "all" but filtered for active status */}
              <p className="py-3">Showing only active vendors</p>
            </TabsContent>
            
            <TabsContent value="pending">
              {/* This will be similar to "all" but filtered for pending status */}
              <p className="py-3">Showing only pending vendors</p>
            </TabsContent>
            
            <TabsContent value="inactive">
              {/* This will be similar to "all" but filtered for inactive status */}
              <p className="py-3">Showing only inactive vendors</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendors;
