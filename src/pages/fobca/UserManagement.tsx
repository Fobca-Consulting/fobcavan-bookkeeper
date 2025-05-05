
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
  UserCheck,
  Clock,
  Search,
  Mail,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// User data interface
interface FobcaUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  active: boolean;
  lastActive: string;
  clients: string[];
}

// Mock user data
const users: FobcaUser[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@fobca.com",
    role: "admin",
    active: true,
    lastActive: "Today, 2:45 PM",
    clients: ["Acme Corporation", "Globex Inc", "Stark Industries"]
  },
  {
    id: 2,
    name: "Maria Johnson",
    email: "maria@fobca.com",
    role: "manager",
    active: true,
    lastActive: "Today, 11:30 AM",
    clients: ["Wayne Enterprises", "Umbrella Corp"]
  },
  {
    id: 3,
    name: "David Brown",
    email: "david@fobca.com",
    role: "staff",
    active: true,
    lastActive: "Yesterday, 4:12 PM",
    clients: ["Acme Corporation"]
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@fobca.com",
    role: "staff",
    active: true,
    lastActive: "Today, 9:20 AM",
    clients: ["Stark Industries", "Globex Inc"]
  },
  {
    id: 5,
    name: "Robert Davis",
    email: "robert@fobca.com",
    role: "manager",
    active: false,
    lastActive: "2 weeks ago",
    clients: []
  }
];

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<FobcaUser | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();

  // Filter users based on search term
  const filteredUsers = users.filter(
    user => {
      return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.role.toLowerCase().includes(searchTerm.toLowerCase());
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
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="staff">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Admin can access all features, Manager can manage clients but not users, Staff has limited access
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
                {filteredUsers.map(user => (
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
                        {user.lastActive}
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
                  <p className="text-sm font-medium">{selectedUser.lastActive}</p>
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
              
              <div>
                <Label className="mb-2 block">Client Access</Label>
                {selectedUser.clients.length > 0 ? (
                  <Card>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {selectedUser.clients.map((client, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span>{client}</span>
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
                <Button variant="outline" size="sm" onClick={() => handleResetPassword(selectedUser.id)}>
                  <Lock className="mr-2 h-4 w-4" />
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
