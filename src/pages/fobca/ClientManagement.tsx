import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Users, 
  Activity, 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  Search,
  Copy,
  ExternalLink,
  UserCheck,
  UserX,
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useClientActivities } from "@/hooks/useClientActivities";
import { format } from "date-fns";

// Client and Document Interfaces
interface Client {
  id: number | string;
  name: string;
  contact: string;
  email: string;
  portalAccess: boolean;
  lastActive: string;
  clientType: "direct" | "indirect";
  portalUrl: string;
  documents: Document[];
}

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

// Form validation schema
const inviteClientSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  clientType: z.enum(["direct", "indirect"], {
    required_error: "Please select a client type",
  }),
  message: z.string().optional(),
});

type InviteClientFormValues = z.infer<typeof inviteClientSchema>;

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real clients data from database
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch activities
  const { activities, loading: activitiesLoading, refetch: refetchActivities } = useClientActivities();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive"
        });
        return;
      }

      // Transform database data to match Client interface
      const transformedClients: Client[] = data.map(client => ({
        id: client.id,
        name: client.business_name,
        clientType: client.client_type as "direct" | "indirect",
        contact: client.contact_name,
        email: client.email,
        portalAccess: client.portal_access,
        lastActive: client.last_active ? new Date(client.last_active).toISOString().split('T')[0] : "Never",
        portalUrl: `/client/${client.business_name.toLowerCase().replace(/\s+/g, '-')}`,
        documents: [] // TODO: Implement documents relationship
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error('Error in fetchClients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Form setup for inviting clients
  const form = useForm<InviteClientFormValues>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      clientType: "direct",
      message: "",
    },
  });

  // Form setup for editing clients
  const editForm = useForm<InviteClientFormValues>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      clientType: "direct",
      message: "",
    },
  });

  // Component State and Helper Functions
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = currentTab === "all" || 
                      (currentTab === "direct" && client.clientType === "direct") ||
                      (currentTab === "indirect" && client.clientType === "indirect");
    
    return matchesSearch && matchesTab;
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Onboarding link has been copied to clipboard",
    });
  };

  const handleInviteClient = async (values: InviteClientFormValues) => {
    setIsInviting(true);

    try {
      // Ensure the caller session is valid (prevents stale JWT after user deletion)
      const { error: userError } = await supabase.auth.getUser();
      if (userError) {
        await supabase.auth.signOut({ scope: "local" });
        toast({
          title: "Session expired",
          description: "Please sign in again, then retry inviting the client.",
          variant: "destructive",
        });
        return;
      }

      // Generate temporary password for the client
      const tempPassword = generatePassword();

      // Call the edge function to create client user
      const { data, error } = await supabase.functions.invoke("create-client-user", {
        body: {
          email: values.email,
          businessName: values.businessName,
          contactName: values.contactName,
          clientType: values.clientType,
          phone: values.phone,
          address: values.address,
          tempPassword: tempPassword,
          message: values.message,
        },
      });

      if (error) {
        throw error;
      }

      // Check if the response indicates an error
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Client created successfully",
        description: `${values.businessName} has been added and welcome email sent to ${values.email}`,
      });
      
      // Reset form and close dialog
      form.reset();
      setShowInviteDialog(false);
      
      // Refresh the clients list
      await fetchClients();
      
    } catch (error: any) {
      console.error("Error inviting client:", error);
      
      // Check if it's an email already exists error
      const errorMessage = error.message || "Please try again later";
      const isEmailExistsError = errorMessage.toLowerCase().includes('already registered') || 
                                 errorMessage.toLowerCase().includes('already exists');
      
      toast({
        title: isEmailExistsError ? "Email Already Registered" : "Failed to create client",
        description: isEmailExistsError 
          ? `The email ${values.email} is already associated with another client. Please use a different email address.`
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const generateOnboardingLink = (businessName: string) => {
    return `${window.location.origin}/onboard/${businessName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const navigateToClientDashboard = (clientId: number | string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      window.open(client.portalUrl, '_blank');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    editForm.reset({
      businessName: client.name,
      contactName: client.contact,
      email: client.email,
      phone: "",
      address: "",
      clientType: client.clientType,
      message: "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateClient = async (values: InviteClientFormValues) => {
    if (!editingClient) return;

    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          business_name: values.businessName,
          contact_name: values.contactName,
          email: values.email,
          phone: values.phone || null,
          address: values.address || null,
          client_type: values.clientType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', String(editingClient.id));

      if (error) throw error;

      toast({
        title: "Client updated",
        description: `${values.businessName} has been updated successfully`,
      });
      
      setShowEditDialog(false);
      setEditingClient(null);
      await fetchClients();
      refetchActivities();
      
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast({
        title: "Failed to update client",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Component Rendering
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Management</h2>
          <p className="text-muted-foreground">
            Manage your client relationships and portal access
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Invite New Client</DialogTitle>
                <DialogDescription>
                  Invite a new client to the FOBCA Bookkeeper portal. They will receive login credentials via email.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleInviteClient)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3 ${field.value === 'direct' ? 'border-primary bg-primary/5' : ''}`}>
                              <input
                                type="radio"
                                value="direct"
                                checked={field.value === 'direct'}
                                onChange={() => field.onChange('direct')}
                                className="mt-1"
                              />
                              <div>
                                <div className="font-medium">Direct Client</div>
                                <div className="text-sm text-muted-foreground">
                                  Full access to portal and services
                                </div>
                              </div>
                            </div>
                            <div className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3 ${field.value === 'indirect' ? 'border-primary bg-primary/5' : ''}`}>
                              <input
                                type="radio"
                                value="indirect"
                                checked={field.value === 'indirect'}
                                onChange={() => field.onChange('indirect')}
                                className="mt-1"
                              />
                              <div>
                                <div className="font-medium">Indirect Client</div>
                                <div className="text-sm text-muted-foreground">
                                  Limited portal access through partner
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invitation Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add a personal message to your invitation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    <DialogFooter className="flex-shrink-0 mt-6 pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowInviteDialog(false)}
                        disabled={isInviting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? "Creating..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading clients...
                      </TableCell>
                    </TableRow>
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No clients found. Invite your first client to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map(client => (
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
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-600">
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{client.lastActive}</TableCell>
                        <TableCell>
                           <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              title="Edit client"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(client.portalUrl)}
                              title="Copy link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToClientDashboard(client.id)}
                              title="Open portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search direct clients..." 
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
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No direct clients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.contact}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          {client.portalAccess ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-600">
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{client.lastActive}</TableCell>
                         <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              title="Edit client"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(client.portalUrl)}
                              title="Copy link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToClientDashboard(client.id)}
                              title="Open portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indirect" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search indirect clients..." 
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
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No indirect clients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map(client => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.contact}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          {client.portalAccess ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-600">
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{client.lastActive}</TableCell>
                         <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              title="Edit client"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(client.portalUrl)}
                              title="Copy link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm" 
                              onClick={() => setSelectedClient(client)}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToClientDashboard(client.id)}
                              title="Open portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest client management activity by staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity. Activity will be logged when clients are created or updated.
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activity.action_type === 'created' ? <UserPlus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Detail Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                {selectedClient.name}
              </DialogTitle>
              <DialogDescription>
                Client details and portal information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Information
                  </Label>
                  <div className="space-y-1 text-sm">
                    <p><strong>Contact:</strong> {selectedClient.contact}</p>
                    <p><strong>Email:</strong> {selectedClient.email}</p>
                    <p><strong>Type:</strong> {selectedClient.clientType === "direct" ? "Direct Client" : "Indirect Client"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Portal Access
                  </Label>
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong> {selectedClient.portalAccess ? "Active" : "Inactive"}</p>
                    <p><strong>Last Active:</strong> {selectedClient.lastActive}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyLink(selectedClient.portalUrl)}
                      className="mt-2"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Portal Link
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Shared Documents ({selectedClient.documents.length})
                </Label>
                <div className="border rounded-lg">
                  {selectedClient.documents.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No documents shared yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClient.documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{doc.date}</TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
              <Button onClick={() => navigateToClientDashboard(selectedClient.id)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Portal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information. Changes will be logged in activity feed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateClient)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3 ${field.value === 'direct' ? 'border-primary bg-primary/5' : ''}`}>
                              <input
                                type="radio"
                                value="direct"
                                checked={field.value === 'direct'}
                                onChange={() => field.onChange('direct')}
                                className="mt-1"
                              />
                              <div>
                                <div className="font-medium">Direct Client</div>
                                <div className="text-sm text-muted-foreground">
                                  Full access to portal and services
                                </div>
                              </div>
                            </div>
                            <div className={`border rounded-md p-4 cursor-pointer hover:border-primary flex items-start space-x-3 ${field.value === 'indirect' ? 'border-primary bg-primary/5' : ''}`}>
                              <input
                                type="radio"
                                value="indirect"
                                checked={field.value === 'indirect'}
                                onChange={() => field.onChange('indirect')}
                                className="mt-1"
                              />
                              <div>
                                <div className="font-medium">Indirect Client</div>
                                <div className="text-sm text-muted-foreground">
                                  Limited portal access through partner
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="flex-shrink-0 mt-6 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEditDialog(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientManagement;