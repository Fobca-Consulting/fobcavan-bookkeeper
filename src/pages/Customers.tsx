
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
import { Eye, Filter, PlusCircle, Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Mock customers data
const customers = [
  {
    id: 1,
    name: "Acme Corporation",
    contactName: "John Smith",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    balance: 5320.75,
    currency: "USD",
    lastInvoice: "2023-05-15",
  },
  {
    id: 2,
    name: "Globex Industries",
    contactName: "Jane Doe",
    email: "jane@globex.com",
    phone: "+1 (555) 987-6543",
    status: "active",
    balance: 1250.00,
    currency: "USD",
    lastInvoice: "2023-05-10",
  },
  {
    id: 3,
    name: "Stark Enterprises",
    contactName: "Tony Stark",
    email: "tony@stark.com",
    phone: "+1 (555) 111-2222",
    status: "inactive",
    balance: 0,
    currency: "USD",
    lastInvoice: "2023-02-28",
  },
  {
    id: 4,
    name: "Wayne Industries",
    contactName: "Bruce Wayne",
    email: "bruce@wayne.com",
    phone: "+1 (555) 333-4444",
    status: "active",
    balance: 8750.50,
    currency: "USD",
    lastInvoice: "2023-05-20",
  },
  {
    id: 5,
    name: "Oscorp",
    contactName: "Norman Osborn",
    email: "norman@oscorp.com",
    phone: "+1 (555) 555-6666",
    status: "pending",
    balance: 3200.25,
    currency: "USD",
    lastInvoice: "2023-05-01",
  },
];

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filter customers based on search query and status filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="all">All Customers</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
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
                    <TableHead>Last Invoice</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{customer.contactName}</span>
                          <span className="text-sm text-muted-foreground">{customer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          customer.status === "active" ? "success" : 
                          customer.status === "pending" ? "warning" : "secondary"
                        }>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.balance, customer.currency)}
                      </TableCell>
                      <TableCell>{customer.lastInvoice}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-2">No customers found</p>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              {/* This will be similar to "all" but filtered for active status */}
              <p className="py-3">Showing only active customers</p>
            </TabsContent>
            
            <TabsContent value="pending">
              {/* This will be similar to "all" but filtered for pending status */}
              <p className="py-3">Showing only pending customers</p>
            </TabsContent>
            
            <TabsContent value="inactive">
              {/* This will be similar to "all" but filtered for inactive status */}
              <p className="py-3">Showing only inactive customers</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
