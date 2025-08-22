import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, Filter, User, Activity, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userType: "direct" | "indirect";
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: "success" | "failed" | "warning";
}

// Sample audit trail data
const sampleAuditData: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2023-12-15 14:30:25",
    user: "john.doe@client.com",
    userType: "direct",
    action: "Created Transaction",
    module: "Accounting",
    details: "Invoice #INV-2023-001 created for $2,500.00",
    ipAddress: "192.168.1.100",
    status: "success"
  },
  {
    id: "2",
    timestamp: "2023-12-15 14:25:10",
    user: "admin@fobca.com",
    userType: "indirect",
    action: "Updated Client Settings",
    module: "Administration",
    details: "Modified chart of accounts for Wayne Enterprises",
    ipAddress: "10.0.0.50",
    status: "success"
  },
  {
    id: "3",
    timestamp: "2023-12-15 14:20:45",
    user: "jane.smith@client.com",
    userType: "direct",
    action: "Failed Login Attempt",
    module: "Authentication",
    details: "Invalid password attempt",
    ipAddress: "192.168.1.105",
    status: "failed"
  },
  {
    id: "4",
    timestamp: "2023-12-15 14:15:30",
    user: "manager@fobca.com",
    userType: "indirect",
    action: "Generated Report",
    module: "Reports",
    details: "Financial statements exported for Q4 2023",
    ipAddress: "10.0.0.45",
    status: "success"
  },
  {
    id: "5",
    timestamp: "2023-12-15 14:10:15",
    user: "bob.johnson@client.com",
    userType: "direct",
    action: "Deleted Transaction",
    module: "Accounting",
    details: "Expense entry #EXP-2023-089 deleted",
    ipAddress: "192.168.1.110",
    status: "warning"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "success": return "bg-green-100 text-green-800";
    case "failed": return "bg-red-100 text-red-800";
    case "warning": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case "direct": return "bg-blue-100 text-blue-800";
    case "indirect": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const AuditTrail = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterModule, setFilterModule] = useState("all");

  // Check if user is admin (FOBCA admin or profile role admin)
  const isAdmin = user?.email?.includes('@fobca.com') || user?.user_metadata?.role === 'admin';

  // Restrict access to admin only
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only administrators can access the audit trail.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredData = sampleAuditData.filter(entry => {
    const matchesSearch = entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUserFilter = filterUser === "all" || entry.userType === filterUser;
    const matchesModuleFilter = filterModule === "all" || entry.module === filterModule;
    
    return matchesSearch && matchesUserFilter && matchesModuleFilter;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Complete activity log for all direct and indirect users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="direct">Direct Users</SelectItem>
              <SelectItem value="indirect">FOBCA Users</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Accounting">Accounting</SelectItem>
              <SelectItem value="Reports">Reports</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Authentication">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Trail Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                  <TableCell className="font-medium">{entry.user}</TableCell>
                  <TableCell>
                    <Badge className={getUserTypeColor(entry.userType)}>
                      {entry.userType === "direct" ? "Direct User" : "FOBCA User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{entry.action}</TableCell>
                  <TableCell>{entry.module}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.details}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.ipAddress}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No audit entries found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};