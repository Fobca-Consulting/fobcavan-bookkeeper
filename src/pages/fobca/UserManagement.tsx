import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, MoreVertical, Mail, User, Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  email: string;
  active: boolean;
  last_active: string | null;
  created_at: string;
}

// Schema for add user form
const addUserSchema = z.object({
  full_name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  send_email: z.boolean().optional(),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

const fetchUsers = async (): Promise<UserProfile[]> => {
  // Get all users from auth.users and join with profiles
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      role,
      active,
      last_active,
      created_at
    `);

  if (error) throw error;

  // Get email for each user since it's not in the profiles table
  const usersWithEmail = await Promise.all(
    users.map(async (user) => {
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_email', { user_id: user.id });
      
      if (userError) console.error("Error fetching user email:", userError);
      
      return {
        ...user,
        email: userData || 'Email not available',
      };
    })
  );

  return usersWithEmail;
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'staff',
      send_email: true,
    },
  });

  const editForm = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'staff',
      send_email: false,
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (values: AddUserFormValues) => {
      // Fix: Use the correct parameters according to Supabase's API
      const { data, error } = await supabase.auth.admin.createUser({
        email: values.email,
        email_confirm: true,
        user_metadata: {
          full_name: values.full_name,
          role: values.role,
        },
        // Fix: Use the correct property for sending invite emails
        ...(values.send_email ? { password: null } : {})
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      setAddUserOpen(false);
      form.reset();
      toast({
        title: "User added successfully",
        description: "The new user has been added to the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: AddUserFormValues & { id?: string }) => {
      if (!values.id) throw new Error("User ID is required");
      
      // Update user metadata and email
      const { error } = await supabase.auth.admin.updateUserById(values.id, {
        email: values.email,
        user_metadata: {
          full_name: values.full_name,
          role: values.role,
        },
      });
      
      if (error) throw error;
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: values.full_name,
          role: values.role,
        })
        .eq('id', values.id);
        
      if (profileError) throw profileError;
      
      return values;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      setEditUserOpen(false);
      editForm.reset();
      toast({
        title: "User updated successfully",
        description: "The user information has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      // Update user's active status in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ active })
        .eq('id', userId);
      
      if (error) throw error;
      
      return { userId, active };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['users']});
      toast({
        title: `User ${data.active ? 'activated' : 'deactivated'}`,
        description: `The user has been ${data.active ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onAddUserSubmit = (values: AddUserFormValues) => {
    addUserMutation.mutate(values);
  };

  const onEditUserSubmit = (values: AddUserFormValues) => {
    if (currentUser) {
      updateUserMutation.mutate({
        ...values,
        id: currentUser.id,
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    editForm.reset({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
    setEditUserOpen(true);
  };

  const handleToggleUserStatus = (user: UserProfile) => {
    toggleUserStatusMutation.mutate({
      userId: user.id,
      active: !user.active,
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'manager':
        return <Badge variant="default">Manager</Badge>;
      default:
        return <Badge variant="outline">Staff</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Add a new staff member to the FOBCA Bookkeeping system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddUserSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter full name" className="pl-9" {...field} />
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
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="email" placeholder="Enter email address" className="pl-9" {...field} />
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Access level for the user
                        </div>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="send_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Send Welcome Email</FormLabel>
                        <FormDescription>
                          Send an email invitation to set up their account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addUserMutation.isPending}>
                    {addUserMutation.isPending ? "Adding..." : "Add User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>Error loading users: {(error as Error).message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_active ? (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                            {new Date(user.last_active).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                              {user.active ? 'Deactivate' : 'Activate'} User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditUserSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Label htmlFor="active-status">Active Status</Label>
                <Switch 
                  id="active-status" 
                  checked={currentUser?.active} 
                  onCheckedChange={() => {
                    if (currentUser) handleToggleUserStatus(currentUser);
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
