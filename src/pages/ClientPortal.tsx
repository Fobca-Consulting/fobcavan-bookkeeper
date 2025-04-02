
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  MoreVertical, 
  UserPlus, 
  FileText, 
  Upload,
  UserCheck,
  Clock,
  Search,
  Download,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock client data
const clients = [
  {
    id: 1,
    name: "Acme Corporation",
    contact: "John Doe",
    email: "john@acmecorp.com",
    phone: "555-1234",
    portalAccess: true,
    lastActive: "2023-05-15",
    documents: [
      { id: 1, name: "Invoice #1001", type: "invoice", date: "2023-04-15", size: "245KB" },
      { id: 2, name: "Contract 2023", type: "contract", date: "2023-01-10", size: "1.2MB" },
    ]
  },
  {
    id: 2,
    name: "Globex Inc",
    contact: "Jane Smith",
    email: "jane@globex.com",
    phone: "555-5678",
    portalAccess: true,
    lastActive: "2023-05-10",
    documents: [
      { id: 3, name: "Invoice #985", type: "invoice", date: "2023-05-02", size: "230KB" },
      { id: 4, name: "Tax Report", type: "report", date: "2023-04-15", size: "540KB" },
    ]
  },
  {
    id: 3,
    name: "Stark Industries",
    contact: "Tony Stark",
    email: "tony@stark.com",
    phone: "555-4321",
    portalAccess: false,
    lastActive: "Never",
    documents: []
  },
  {
    id: 4,
    name: "Wayne Enterprises",
    contact: "Bruce Wayne",
    email: "bruce@wayne.com",
    phone: "555-8765",
    portalAccess: true,
    lastActive: "2023-05-12",
    documents: [
      { id: 5, name: "Financial Statement", type: "report", date: "2023-05-01", size: "890KB" },
    ]
  },
  {
    id: 5,
    name: "Umbrella Corp",
    contact: "Albert Wesker",
    email: "wesker@umbrella.com",
    phone: "555-7890",
    portalAccess: false,
    lastActive: "Never",
    documents: []
  }
];

// Shared activities
const sharedActivities = [
  { id: 1, client: "Acme Corporation", document: "Invoice #1001", date: "2023-05-15", action: "Viewed" },
  { id: 2, client: "Globex Inc", document: "Tax Report", date: "2023-05-12", action: "Downloaded" },
  { id: 3, client: "Wayne Enterprises", document: "Financial Statement", date: "2023-05-10", action: "Viewed" },
  { id: 4, client: "Acme Corporation", document: "Contract 2023", date: "2023-05-08", action: "Downloaded" },
  { id: 5, client: "Globex Inc", document: "Invoice #985", date: "2023-05-05", action: "Viewed" }
];

const ClientPortal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Filter clients based on search term
  const filteredClients = clients.filter(
    client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
             client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to provide portal access for document sharing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Business Name
                </Label>
                <Input id="name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  Contact Name
                </Label>
                <Input id="contact" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portal-access" className="text-right">
                  Portal Access
                </Label>
                <Switch id="portal-access" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="clients">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Portal Access</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        {client.portalAccess ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.lastActive !== "Never" ? (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                            {client.lastActive}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Share Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Switch 
                                id={`portal-access-${client.id}`}
                                checked={client.portalAccess}
                                className="mr-2"
                              />
                              Portal Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Activity</CardTitle>
              <CardDescription>See how clients are interacting with shared documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.client}</TableCell>
                      <TableCell>{activity.document}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Detail Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedClient.name}</DialogTitle>
              <DialogDescription>
                Client details and shared documents
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Contact Info</TabsTrigger>
                <TabsTrigger value="documents">Shared Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <p className="text-sm font-medium">{selectedClient.contact}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm font-medium">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label>Portal Access</Label>
                    <p className="text-sm font-medium">
                      {selectedClient.portalAccess ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <Label>Last Active</Label>
                    <p className="text-sm font-medium">{selectedClient.lastActive}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Shared Documents</h3>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Share New Document
                  </Button>
                </div>
                
                {selectedClient.documents && selectedClient.documents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Shared</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClient.documents.map(document => (
                        <TableRow key={document.id}>
                          <TableCell>{document.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {document.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{document.date}</TableCell>
                          <TableCell>{document.size}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No documents have been shared with this client yet.</p>
                    <Button variant="outline" className="mt-4">
                      <Upload className="mr-2 h-4 w-4" />
                      Share a Document
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientPortal;
