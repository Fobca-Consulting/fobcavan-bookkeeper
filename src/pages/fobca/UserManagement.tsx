
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/users/UserTable";
import UserFormDialog from "@/components/users/UserFormDialog";
import useUsers from "@/hooks/users/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UserManagement = () => {
  const {
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
    handleDeleteUser,
  } = useUsers();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if the current user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate('/fobca');
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      }
    };
    
    checkAdmin();
  }, [user, navigate]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddUser}>Add New User</Button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onEditUser={handleEditUser}
        onToggleStatus={toggleUserStatus}
        onDeleteUser={handleDeleteUser}
      />

      <UserFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        currentUser={currentUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default UserManagement;
