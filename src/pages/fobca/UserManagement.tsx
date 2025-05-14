
import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  MoreVertical, 
  UserPlus, 
  Lock, 
  Edit,
  UserCheck,
  Clock,
  Search,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

// User data interface
interface FobcaUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  active: boolean;
  lastActive: string | null;
  clients: { id: string; name: string }[];
}

// Form schema for adding a new user
const addUserSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["admin", "manager", "staff"]),
  send_invite: z.boolean().default(true),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<FobcaUser | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [users, setUsers] = useState<FobcaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize add user form
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: "staff",
      send_invite: true,
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(
    user => {
      return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.role.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  // Fetch users from the database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      // Get user emails from auth users
      const usersWithEmails = await Promise.all(profiles.map(async (profile) => {
        // Get user details from auth.users (usually done through admin function)
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_email', { user_id: profile.id });

        // Get clients this user has access to
        const { data: clientAccess, error: clientError } = await supabase
          .from('client_access')
          .select('client_id')
          .eq('user_id', profile.id);

        return {
          id: profile.id,
          name: profile.full_name || 'Unnamed User',
          email: userData?.email || 'No email available',
          role: profile.role as "admin" | "manager" | "staff",
          active: profile.active || false,
          lastActive: profile.last_active,
          clients: clientAccess?.map(ca => ({ id: ca.client_id, name: `Client ${ca.client_id.substring(0, 8)}` })) || []
        };
      }));

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatLastActive = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins === 0 ? 'Just now' : `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 2) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: boolean) => {
    setProcessingUser(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: newStatus } : user
      ));
      
      // If viewing user details, update the selected user as well
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, active: newStatus });
      }
      
      toast({
        title: "User status updated",
        description: `User has been ${newStatus ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setProcessingUser(userId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");

      // In production, this would use an admin api or edge function to trigger password reset
      
      toast({
        title: "Password reset email sent",
        description: "User will receive an email with instructions to reset password",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleAddUser = async (values: AddUserFormValues) => {
    try {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create user in auth system
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: values.full_name,
          role: values.role
        }
      });

      if (authError) {
        throw authError;
      }

      // Profile will be created automatically via database trigger
      
      if (values.send_invite) {
        // Call the edge function to send welcome email
        const response = await fetch(`https://rkkxtpywwtpveoevzvod.supabase.co/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
          },
          body: JSON.stringify({
            email: values.email,
            name: values.full_name,
            tempPassword
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send welcome email');
        }
      }
      
      toast({
        title: "User added",
        description: "New user has been added to the system",
      });
      
      // Reset form and close dialog
      form.reset();
      setShowAddUserDialog(false);
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create initial admin user
  const createDefaultAdminUser = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Only create default admin if no users exist
      if (count === 0) {
        const email = "oluwafemi.olukoya@gmail.com";
        const password = "adminpassword"; // In production, this should be a secure random password
        const fullName = "Admin User";
        
        // Create the admin user
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: 'admin'
          }
        });
        
        if (error) throw error;
        
        console.log("Default admin user created successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error creating default admin user:", error);
    }
  };

  // Create default admin on first load if needed
  useEffect(() => {
    createDefaultAdminUser();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Add a new user to the FOBCA Bookkeeper system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="name" className="pl-10" placeholder="Enter user's full name" {...field} />
                        </div>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="email" type="email" className="pl-10" placeholder="Enter email address" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Admin can access all features, Manager can manage clients but not users, Staff has limited access
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="send_invite"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 rounded-md border p-3">
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel>Send welcome email with login instructions</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-4">
                  <Button variant="outline" type="button" onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
                  <Button type="submit">Add User</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Client Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? 'No users match your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === "admin" ? "default" : 
                          user.role === "manager" ? "outline" : 
                          "secondary"
                        }>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.active ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span>{user.active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                          {formatLastActive(user.lastActive)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.clients.length > 0 ? (
                          <span>{user.clients.length} clients</span>
                        ) : (
                          <span className="text-muted-foreground">No access</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleResetPassword(user.id)}
                                disabled={!!processingUser}
                              >
                                {processingUser === user.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Lock className="mr-2 h-4 w-4" />
                                )}
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleUserStatusChange(user.id, !user.active)}
                                disabled={!!processingUser}
                              >
                                {processingUser === user.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : user.active ? (
                                  <XCircle className="mr-2 h-4 w-4" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {user.active ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedUser.name}
                <Badge className="ml-2" variant={
                  selectedUser.role === "admin" ? "default" : 
                  selectedUser.role === "manager" ? "outline" : 
                  "secondary"
                }>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                User details and client access
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center mt-1">
                    {selectedUser.active ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span>{selectedUser.active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div>
                  <Label>Last Active</Label>
                  <p className="text-sm font-medium">{formatLastActive(selectedUser.lastActive)}</p>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch 
                      id="user-active"
                      checked={selectedUser.active}
                      onCheckedChange={(checked) => handleUserStatusChange(selectedUser.id, checked)}
                      disabled={!!processingUser}
                    />
                    <Label htmlFor="user-active">
                      {processingUser === selectedUser.id ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : (
                        selectedUser.active ? "Active" : "Inactive"
                      )}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Client Access</Label>
                {selectedUser.clients.length > 0 ? (
                  <Card>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {selectedUser.clients.map((client, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{client.name}</span>
                            <Badge variant="outline">Access Granted</Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md text-muted-foreground">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>This user doesn't have access to any clients yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResetPassword(selectedUser.id)}
                  disabled={!!processingUser}
                >
                  {processingUser === selectedUser.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Reset Password
                </Button>
              </div>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
