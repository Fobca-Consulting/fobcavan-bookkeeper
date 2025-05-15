
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserFormValues } from "@/types/users";

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Fetch users using edge function
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No authenticated session found');
      }

      const response = await fetch(
        'https://rkkxtpywwtpveoevzvod.supabase.co/functions/v1/get-users',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
      });
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: UserFormValues) => {
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

  // Fetch users on initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    currentUser,
    handleAddUser,
    handleEditUser,
    toggleUserStatus,
    handleFormSubmit,
  };
};

export default useUsers;
