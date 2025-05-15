
import React from "react";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/users/UserTable";
import UserFormDialog from "@/components/users/UserFormDialog";
import useUsers from "@/hooks/users/useUsers";

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
  } = useUsers();

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
