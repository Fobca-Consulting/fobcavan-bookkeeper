import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

const modules = [
  "Dashboard",
  "Transactions", 
  "Accounts",
  "Customers",
  "Vendors",
  "Invoices",
  "Reports",
  "Bank Reconciliation",
  "Multi-Currency",
  "Investments",
  "Journal Posting",
  "Chart of Accounts",
  "Settings"
];

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@acme.com",
    role: "Accountant",
    permissions: modules.map(module => ({
      module,
      view: true,
      create: module !== "Reports",
      edit: module !== "Reports",
      delete: false
    }))
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane@acme.com",
    role: "Bookkeeper",
    permissions: modules.map(module => ({
      module,
      view: ["Dashboard", "Transactions", "Accounts", "Reports"].includes(module),
      create: ["Transactions", "Accounts"].includes(module),
      edit: ["Transactions", "Accounts"].includes(module),
      delete: false
    }))
  }
];

const UserPermissions = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0]);
  const { toast } = useToast();

  const updatePermission = (moduleIndex: number, permissionType: keyof Omit<Permission, 'module'>, value: boolean) => {
    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      permissions: selectedUser.permissions.map((perm, index) => 
        index === moduleIndex 
          ? { ...perm, [permissionType]: value }
          : perm
      )
    };

    setSelectedUser(updatedUser);
    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id ? updatedUser : user
    ));
  };

  const savePermissions = () => {
    toast({
      title: "Permissions Updated",
      description: `Permissions for ${selectedUser?.name} have been successfully updated.`,
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      "Admin": "bg-red-100 text-red-800",
      "Accountant": "bg-blue-100 text-blue-800", 
      "Bookkeeper": "bg-green-100 text-green-800",
      "User": "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.User}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Permissions Management</h1>
        <Badge className="bg-primary/10 text-primary">
          <Shield className="h-4 w-4 mr-1" />
          Admin Only
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUser?.id === user.id 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="mt-2">{getRoleBadge(user.role)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Permissions for {selectedUser?.name}
            </CardTitle>
            <Button onClick={savePermissions}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardHeader>
          <CardContent>
            {selectedUser && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">View</TableHead>
                    <TableHead className="text-center">Create</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedUser.permissions.map((permission, index) => (
                    <TableRow key={permission.module}>
                      <TableCell className="font-medium">{permission.module}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={permission.view}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'view', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={permission.create}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'create', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={permission.edit}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'edit', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={permission.delete}
                          onCheckedChange={(checked) => 
                            updatePermission(index, 'delete', checked as boolean)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPermissions;