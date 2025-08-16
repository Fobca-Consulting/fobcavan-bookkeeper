import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  glCode: string;
  accountName: string;
  accountType: string;
  parentAccount?: string;
  description: string;
  isActive: boolean;
  createdDate: string;
}

const accountTypes = [
  "Asset",
  "Liability", 
  "Equity",
  "Revenue",
  "Expense",
  "Other Comprehensive Income"
];

const mockAccounts: Account[] = [
  {
    id: "1",
    glCode: "1001",
    accountName: "Cash",
    accountType: "Asset",
    description: "Cash on hand and in bank accounts",
    isActive: true,
    createdDate: "2024-01-01"
  },
  {
    id: "2",
    glCode: "1200", 
    accountName: "Accounts Receivable",
    accountType: "Asset",
    description: "Amounts owed by customers",
    isActive: true,
    createdDate: "2024-01-01"
  },
  {
    id: "3",
    glCode: "1300",
    accountName: "Inventory",
    accountType: "Asset", 
    description: "Goods held for sale",
    isActive: true,
    createdDate: "2024-01-01"
  },
  {
    id: "4",
    glCode: "2001",
    accountName: "Accounts Payable",
    accountType: "Liability",
    description: "Amounts owed to vendors",
    isActive: true,
    createdDate: "2024-01-01"
  },
  {
    id: "5",
    glCode: "4001",
    accountName: "Service Revenue",
    accountType: "Revenue",
    description: "Revenue from services provided",
    isActive: true,
    createdDate: "2024-01-01"
  }
];

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    glCode: "",
    accountName: "",
    accountType: "",
    parentAccount: "",
    description: "",
    isActive: true
  });

  const filteredAccounts = accounts.filter(account =>
    account.glCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      // Update existing account
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccount.id 
          ? { ...acc, ...formData }
          : acc
      ));
      toast({
        title: "Account Updated",
        description: "The account has been successfully updated.",
      });
    } else {
      // Create new account
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setAccounts(prev => [...prev, newAccount]);
      toast({
        title: "Account Created",
        description: "New account has been successfully created.",
      });
    }

    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      glCode: "",
      accountName: "",
      accountType: "",
      parentAccount: "",
      description: "",
      isActive: true
    });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      glCode: account.glCode,
      accountName: account.accountName,
      accountType: account.accountType,
      parentAccount: account.parentAccount || "",
      description: account.description,
      isActive: account.isActive
    });
    setIsDialogOpen(true);
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setFormData({
      glCode: "",
      accountName: "",
      accountType: "",
      parentAccount: "",
      description: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      "Asset": "bg-blue-100 text-blue-800",
      "Liability": "bg-red-100 text-red-800",
      "Equity": "bg-purple-100 text-purple-800", 
      "Revenue": "bg-green-100 text-green-800",
      "Expense": "bg-orange-100 text-orange-800",
      "Other Comprehensive Income": "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || colors["Other Comprehensive Income"]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAccount}>
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Account" : "Create New Account"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="glCode">GL Code</Label>
                  <Input
                    id="glCode"
                    value={formData.glCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, glCode: e.target.value }))}
                    placeholder="1001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select 
                    value={formData.accountType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Cash"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentAccount">Parent Account (Optional)</Label>
                <Select 
                  value={formData.parentAccount} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentAccount: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.glCode}>
                        {account.glCode} - {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Account description..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? "Update" : "Create"} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Accounts
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GL Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Parent Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.glCode}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                  <TableCell>{account.parentAccount || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{account.description}</TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccounts;