
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  MoreHorizontal,
  Link as LinkIcon,
  Copy,
  User,
  Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Interface for client data
interface Client {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  portalAccess: boolean;
  lastActive: string;
  clientType: "direct" | "indirect";
  portalUrl?: string;
  documents: {
    id: number;
    name: string;
    type: string;
    date: string;
    size: string;
  }[];
}

// Mock client data
const clients: Client[] = [
  {
    id: 1,
    name: "Acme Corporation",
    contact: "John Doe",
    email: "john@acmecorp.com",
    phone: "555-1234",
    portalAccess: true,
    lastActive: "2023-05-15",
    clientType: "direct",
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
    clientType: "direct",
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
    clientType: "direct",
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
    clientType: "indirect",
    portalUrl: "https://fobca.app/business/wayne-enterprises",
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
    clientType: "indirect",
    portalUrl: "https://fobca.app/business/umbrella-corp",
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

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const { toast } = useToast();

  // Filter clients based on search term and current tab
  const filteredClients = clients.filter(
    client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (currentTab === "all") return matchesSearch;
      if (currentTab === "direct") return matchesSearch && client.clientType === "direct";
      if (currentTab === "indirect") return matchesSearch && client.clientType === "indirect";
      return matchesSearch;
    }
  );

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Onboarding link has been copied to clipboard",
    });
  };

  const handleInviteClient = (values: any) => {
    console.log("Invite values:", values);
    toast({
      title: "Invitation sent",
      description: "Client has been invited to the portal",
    });
    setShowInviteDialog(false);
  };

  const generateOnboardingLink = (businessName: string) => {
    // In a real app, this would generate a unique link with a token
    const slug = businessName.toLowerCase().replace(/\s+/g, '-');
    return `https://fobca.app/onboarding/${slug}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <div className="flex space-x-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New Client</DialogTitle>
                <DialogDescription>
                  Invite a new client to the FOBCA Bookkeeper portal
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="client-type" className="mb-2 block">Client Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3">
                      <input type="radio" name="clientType" id="direct" value="direct" className="mt-1" />
                      <div>
                        <Label htmlFor="direct" className="font-medium cursor-pointer">Direct Client</Label>
                        <p className="text-sm text-muted-foreground">
                          FOBCA manages their accounts with read-only access
                        </p>
                      </div>
                    </div>
                    <div className="border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3">
                      <input type="radio" name="clientType" id="indirect" value="indirect" className="mt-1" />
                      <div>
                        <Label htmlFor="indirect" className="font-medium cursor-pointer">Indirect Client</Label>
                        <p className="text-sm text-muted-foreground">
                          Client manages their own accounts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="business-name" className="pl-10" placeholder="Enter business name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="contact-name" className="pl-10" placeholder="Enter contact name" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="email" type="email" className="pl-10" placeholder="Enter email address" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Invitation Message (Optional)</Label>
                    <Textarea id="message" placeholder="Add a personal message to your invitation" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                <Button onClick={() => handleInviteClient({})}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Direct Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Direct Client</DialogTitle>
                <DialogDescription>
                  Add a new client that FOBCA will manage with optional portal access.
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
      </div>

      <Tabs defaultValue="all" onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="direct">Direct Clients</TabsTrigger>
          <TabsTrigger value="indirect">Indirect Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
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
                    <TableHead>Client Type</TableHead>
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
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <Badge variant={client.clientType === "direct" ? "outline" : "secondary"}>
                          {client.clientType === "direct" ? "Direct" : "Indirect"}
                        </Badge>
                      </TableCell>
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
                            {client.clientType === "indirect" && (
                              <DropdownMenuItem onClick={() => handleCopyLink(client.portalUrl || "")}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Copy Portal Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {client.clientType === "direct" && (
                              <DropdownMenuItem>
                                <div className="flex items-center w-full">
                                  <Switch 
                                    id={`portal-access-${client.id}`}
                                    checked={client.portalAccess}
                                    className="mr-2"
                                  />
                                  <span>Portal Access</span>
                                </div>
                              </DropdownMenuItem>
                            )}
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
        
        <TabsContent value="direct" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search direct clients..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Direct Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Direct Client</DialogTitle>
                  <DialogDescription>
                    Add a new client that FOBCA will manage with optional portal access.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direct-name" className="text-right">
                      Business Name
                    </Label>
                    <Input id="direct-name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direct-contact" className="text-right">
                      Contact Name
                    </Label>
                    <Input id="direct-contact" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direct-email" className="text-right">
                      Email
                    </Label>
                    <Input id="direct-email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direct-phone" className="text-right">
                      Phone
                    </Label>
                    <Input id="direct-phone" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direct-portal-access" className="text-right">
                      Portal Access
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch id="direct-portal-access" />
                      <Label htmlFor="direct-portal-access" className="text-sm text-muted-foreground">
                        Grant read-only access to client portal
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Client</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  {filteredClients
                    .filter(client => client.clientType === "direct")
                    .map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.contact}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`direct-access-${client.id}`}
                              checked={client.portalAccess}
                            />
                            <Label htmlFor={`direct-access-${client.id}`} className="text-sm">
                              {client.portalAccess ? "Enabled" : "Disabled"}
                            </Label>
                          </div>
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
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedClient(client)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="indirect" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search indirect clients..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Generate Onboarding Link
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Portal URL</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients
                    .filter(client => client.clientType === "indirect")
                    .map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.contact}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          {client.portalUrl ? (
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground truncate max-w-xs mr-2">
                                {client.portalUrl}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleCopyLink(client.portalUrl || "")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not generated</span>
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
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedClient(client)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Client Portal Link</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Share this link with your client to access their portal:
                                  </p>
                                  <div className="flex">
                                    <Input 
                                      readOnly 
                                      value={generateOnboardingLink(client.name)} 
                                      className="rounded-r-none"
                                    />
                                    <Button 
                                      className="rounded-l-none" 
                                      onClick={() => handleCopyLink(generateOnboardingLink(client.name))}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
              <DialogTitle className="flex items-center">
                {selectedClient.name}
                <Badge variant={selectedClient.clientType === "direct" ? "outline" : "secondary"} className="ml-2">
                  {selectedClient.clientType === "direct" ? "Direct Client" : "Indirect Client"}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Client details and shared documents
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Contact Info</TabsTrigger>
                <TabsTrigger value="documents">Shared Documents</TabsTrigger>
                {selectedClient.clientType === "indirect" && (
                  <TabsTrigger value="portal">Portal Access</TabsTrigger>
                )}
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
                  {selectedClient.clientType === "direct" && (
                    <div>
                      <Label>Portal Access</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch 
                          id="detail-portal-access"
                          checked={selectedClient.portalAccess}
                        />
                        <Label htmlFor="detail-portal-access" className="text-sm">
                          {selectedClient.portalAccess ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>
                  )}
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

              {selectedClient.clientType === "indirect" && (
                <TabsContent value="portal" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Client Portal URL</h3>
                      <div className="flex">
                        <Input 
                          readOnly 
                          value={selectedClient.portalUrl || generateOnboardingLink(selectedClient.name)} 
                          className="rounded-r-none"
                        />
                        <Button 
                          className="rounded-l-none" 
                          onClick={() => handleCopyLink(selectedClient.portalUrl || generateOnboardingLink(selectedClient.name))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Share this link with your client to access their custom portal.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Send Invitation Email</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="invite-email">Recipient Email</Label>
                          <Input id="invite-email" defaultValue={selectedClient.email} />
                        </div>
                        <div>
                          <Label htmlFor="invite-subject">Subject</Label>
                          <Input 
                            id="invite-subject" 
                            defaultValue={`Access your ${selectedClient.name} Portal on FOBCA Bookkeeper`} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="invite-message">Message</Label>
                          <Textarea 
                            id="invite-message" 
                            rows={4}
                            defaultValue={`Dear ${selectedClient.contact},\n\nYou have been invited to access your business portal on FOBCA Bookkeeper. Please use the following link to complete your registration:\n\n${selectedClient.portalUrl || generateOnboardingLink(selectedClient.name)}\n\nRegards,\nFOBCA Team`} 
                          />
                        </div>
                        <Button>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
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

export default ClientManagement;
