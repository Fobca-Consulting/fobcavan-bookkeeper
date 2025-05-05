
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
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Mail,
  User,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

// User data interface
interface ClientUser {
  id: number;
  name: string;
  email: string;
  accessLevel: "admin" | "edit" | "view";
  active: boolean;
  lastActive: string;
}

// Mock businesses data - in a real app, this would come from a database
const businesses = [
  { 
    id: "acme", 
    name: "Acme Corporation", 
    users: [
      {
        id: 1,
        name: "John Smith",
        email: "john@acmecorp.com",
        accessLevel: "admin" as const,
        active: true,
        lastActive: "Today, 3:45 PM",
      },
      {
        id: 2,
        name: "Lisa Johnson",
        email: "lisa@acmecorp.com",
        accessLevel: "edit" as const,
        active: true,
        lastActive: "Today, 1:30 PM",
      },
      {
        id: 3,
        name: "Mark Davis",
        email: "mark@acmecorp.com",
        accessLevel: "view" as const,
        active: true,
        lastActive: "Yesterday",
      }
    ]
  },
  { 
    id: "globex", 
    name: "Globex Inc", 
    users: [
      {
        id: 1,
        name: "Jane Doe",
        email: "jane@globex.com",
        accessLevel: "admin" as const,
        active: true,
        lastActive: "Today, 11:25 AM",
      },
      {
        id: 2,
        name: "Robert Smith",
        email: "robert@globex.com",
        accessLevel: "edit" as const,
        active: false,
        lastActive: "1 week ago",
      }
    ]
  }
];

const ClientUsers = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();

  // Find business data based on clientId
  const business = businesses.find(b => b.id === clientId) || businesses[0];
  const users = business.users || [];

  // Filter users based on search term
  const filteredUsers = users.filter(
    user => {
      return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.accessLevel.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  const handleUserStatusChange = (userId: number, newStatus: boolean) => {
    // In a real app, this would update the database
    console.log(`Changing status of user ${userId} to ${newStatus}`);
    
    toast({
      title: "User status updated",
      description: `User has been ${newStatus ? "activated" : "deactivated"}`,
    });
  };

  const handleAddUser = (values: any) => {
    // In a real app, this would create a new user
    console.log("Adding new user:", values);
    
    toast({
      title: "User added",
      description: "New user has been added to the system",
    });
    
    setShowAddUserDialog(false);
  };

  const handleResetPassword = (userId: number) => {
    // In a real app, this would trigger a password reset email
    console.log(`Resetting password for user ${userId}`);
    
    toast({
      title: "Password reset email sent",
      description: "User will receive an email with instructions to reset password",
    });
  };

  const getAccessLevelBadgeVariant = (accessLevel: string) => {
    switch (accessLevel) {
      case "admin": return "default";
      case "edit": return "outline";
      case "view": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{business.name} Users</h1>
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
                Add a new user to access the {business.name} portal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="name" className="pl-10" placeholder="Enter user's full name" />
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
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select defaultValue="view">
                  <SelectTrigger id="accessLevel">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="edit">Edit (Can modify data)</SelectItem>
                    <SelectItem value="view">View Only (Read-only access)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Admin can manage users and all data, Edit can modify but not manage users, View can only see data
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="send-invite" defaultChecked />
                <Label htmlFor="send-invite">Send welcome email with login instructions</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Cancel</Button>
              <Button onClick={() => handleAddUser({})}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>
            Manage users who can access your {business.name} portal. You can set access levels and permissions for each user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getAccessLevelBadgeVariant(user.accessLevel)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {user.accessLevel.charAt(0).toUpperCase() + user.accessLevel.slice(1)}
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
                      {user.lastActive}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
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
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, !user.active)}>
                            {user.active ? (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedUser.name}
                <Badge className="ml-2" variant={getAccessLevelBadgeVariant(selectedUser.accessLevel)}>
                  {selectedUser.accessLevel.charAt(0).toUpperCase() + selectedUser.accessLevel.slice(1)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                User details and access level
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
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
                  <p className="text-sm font-medium">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <Select defaultValue={selectedUser.accessLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="edit">Edit (Can modify data)</SelectItem>
                      <SelectItem value="view">View Only (Read-only access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch 
                      id="user-active"
                      checked={selectedUser.active}
                      onCheckedChange={(checked) => handleUserStatusChange(selectedUser.id, checked)}
                    />
                    <Label htmlFor="user-active">
                      {selectedUser.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div>
                <Button variant="outline" size="sm" onClick={() => handleResetPassword(selectedUser.id)}>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setSelectedUser(null)}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientUsers;
