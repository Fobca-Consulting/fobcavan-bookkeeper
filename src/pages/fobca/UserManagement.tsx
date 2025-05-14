
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define user role type to match the database enum
type UserRole = "admin" | "manager" | "staff";

// Define the user profile interface
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  last_active: string;
  created_at: string;
}

// Form schema for user creation/editing
const userFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "manager", "staff"] as const),
  active: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Setup form with react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "staff" as UserRole,
      active: true,
    },
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset form when dialog opens/closes or when editing user changes
  useEffect(() => {
    if (isDialogOpen && isEditing && currentUser) {
      form.reset({
        email: currentUser.email,
        full_name: currentUser.full_name,
        role: currentUser.role,
        active: currentUser.active,
      });
    } else if (isDialogOpen && !isEditing) {
      form.reset({
        email: "",
        full_name: "",
        role: "staff",
        active: true,
      });
    }
  }, [isDialogOpen, isEditing, currentUser, form]);

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // For each profile, get the associated email from auth.users
      const usersWithEmails: UserProfile[] = [];
      
      for (const profile of profilesData) {
        // Get user email through a separate query
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        
        const email = userData?.user?.email || "No email found";
        
        usersWithEmails.push({
          id: profile.id,
          email: email,
          full_name: profile.full_name || "",
          role: (profile.role as UserRole) || "staff",
          active: profile.active || false,
          last_active: profile.last_active ? new Date(profile.last_active).toLocaleString() : "Never",
          created_at: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
        });
      }

      setUsers(usersWithEmails);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing && currentUser) {
        // Update existing user
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: data.full_name,
            role: data.role,
            active: data.active,
          })
          .eq("id", currentUser.id);

        if (error) throw error;

        toast({
          title: "User Updated",
          description: `${data.full_name} has been updated successfully`,
        });
      } else {
        // Create new user
        // In a real app, this would use an admin API to create the user
        // For demo purposes, we're just showing the flow
        toast({
          title: "User Created",
          description: `Invitation sent to ${data.email}`,
        });
      }

      // Close dialog and refresh user list
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Open dialog for editing a user
  const handleEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Open dialog for creating a new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Toggle user active status
  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active: !user.active })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `${user.full_name} is now ${!user.active ? "active" : "inactive"}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Generate badge variant based on user role
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddUser}>Add New User</Button>
      </div>

      <Table>
        <TableCaption>A list of all users in the system</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.active ? "default" : "outline"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{user.last_active}</TableCell>
              <TableCell>{user.created_at}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={user.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleUserStatus(user)}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update user details and permissions"
                : "Enter user information to send an invitation"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user@example.com"
                        {...field}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditing
                        ? "Email cannot be changed"
                        : "User will receive an invitation at this email"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                    <FormDescription>
                      Controls what the user can access in the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive users cannot access the system
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

              <DialogFooter className="pt-4">
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Invite User"}
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
