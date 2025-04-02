
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  Mail, 
  FileText, 
  DollarSign, 
  Clock, 
  Settings, 
  Copy, 
  ExternalLink 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock client data
const clients = [
  { 
    id: 1, 
    name: "Acme Corporation", 
    contact: "John Smith", 
    email: "john@acmecorp.com", 
    phone: "(555) 123-4567",
    portalAccess: true,
    lastActive: "2023-05-20",
  },
  { 
    id: 2, 
    name: "Global Industries", 
    contact: "Sarah Johnson", 
    email: "sarah@globalind.com", 
    phone: "(555) 234-5678",
    portalAccess: true,
    lastActive: "2023-05-25",
  },
  { 
    id: 3, 
    name: "Tech Solutions Inc", 
    contact: "Michael Brown", 
    email: "michael@techsolutions.com", 
    phone: "(555) 345-6789",
    portalAccess: false,
    lastActive: null,
  },
  { 
    id: 4, 
    name: "Creative Design Studio", 
    contact: "Emily Davis", 
    email: "emily@creativeds.com", 
    phone: "(555) 456-7890",
    portalAccess: true,
    lastActive: "2023-05-15",
  },
  { 
    id: 5, 
    name: "Premium Services LLC", 
    contact: "Robert Wilson", 
    email: "robert@premiumservices.com", 
    phone: "(555) 567-8901",
    portalAccess: false,
    lastActive: null,
  },
];

const ClientPortal = () => {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("clients");
  
  const handleInviteClient = (clientId: number) => {
    // In a real app, this would send an invitation to the client
    console.log(`Invitation sent to client ID: ${clientId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Portal Settings
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="clients">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Shared Documents
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="mr-2 h-4 w-4" />
            Portal Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Client Portal Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Input
                    placeholder="Search clients..."
                    className="pl-10"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                
                <div className="flex justify-between items-center">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="active">With Portal Access</SelectItem>
                      <SelectItem value="inactive">No Portal Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Portal Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.portalAccess 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.portalAccess ? 'Active' : 'No Access'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {client.lastActive ? client.lastActive : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        {client.portalAccess ? (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Portal
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleInviteClient(client.id)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Invite
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shared Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="relative w-72">
                    <Input
                      placeholder="Search documents..."
                      className="pl-10"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.filter(c => c.portalAccess).map(client => (
                    <Card key={client.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{client.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground mb-4">
                          {client.documents || 0} shared documents
                        </p>
                        
                        <div className="space-y-2">
                          <div className="p-2 border rounded flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm">Invoice-May2023.pdf</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-2 border rounded flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm">Contract-2023.pdf</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button variant="link" className="px-0 mt-2">
                          View all documents
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Portal Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    placeholder="Search activity..."
                    className="pl-10 w-80"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Document viewed</h4>
                        <span className="text-xs text-muted-foreground ml-2 bg-gray-100 px-2 py-0.5 rounded-full">Acme Corporation</span>
                      </div>
                      <p className="text-sm text-muted-foreground">John Smith viewed Invoice-May2023.pdf</p>
                      <p className="text-xs text-muted-foreground">Today at 10:23 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
                    <div className="bg-green-100 rounded-full p-2 text-green-700">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Payment made</h4>
                        <span className="text-xs text-muted-foreground ml-2 bg-gray-100 px-2 py-0.5 rounded-full">Global Industries</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Sarah Johnson made a payment of $5,250.00</p>
                      <p className="text-xs text-muted-foreground">Yesterday at 3:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-700">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Portal access invitation</h4>
                        <span className="text-xs text-muted-foreground ml-2 bg-gray-100 px-2 py-0.5 rounded-full">Creative Design Studio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Invitation accepted by Emily Davis</p>
                      <p className="text-xs text-muted-foreground">May 21, 2023 at 11:15 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More Activity</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPortal;
