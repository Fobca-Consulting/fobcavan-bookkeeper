
import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types/users";

interface UserTableProps {
  users: UserProfile[];
  onEditUser: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  isLoading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onToggleStatus,
  isLoading,
}) => {
  // Generate badge variant based on user role
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading users...</div>;
  }

  return (
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
                  onClick={() => onEditUser(user)}
                >
                  Edit
                </Button>
                <Button
                  variant={user.active ? "outline" : "default"}
                  size="sm"
                  onClick={() => onToggleStatus(user)}
                >
                  {user.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
