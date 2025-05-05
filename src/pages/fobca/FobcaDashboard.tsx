
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DollarSign, 
  Users, 
  UserCheck, 
  BarChart3, 
  PieChart, 
  Building, 
  Clock, 
  Eye, 
  FileText, 
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";

// Mock data for analytics
const analyticsData = {
  totalClients: 48,
  activeClients: 32,
  totalRevenue: 124500,
  monthlyRevenue: 15600,
  growthRate: 8.5,
  clientGrowth: 12.3,
  averageClientRevenue: 2593.75,
  revenueByType: {
    direct: 75000,
    indirect: 49500
  }
};

// Recent activities
const recentActivities = [
  { id: 1, client: "Acme Corporation", action: "Added new user", time: "2h ago", user: "John Smith" },
  { id: 2, client: "Globex Inc", action: "Updated account details", time: "5h ago", user: "Maria Johnson" },
  { id: 3, client: "Wayne Enterprises", action: "Shared document", time: "Yesterday", user: "David Brown" },
  { id: 4, client: "Stark Industries", action: "Portal access enabled", time: "2 days ago", user: "Sarah Wilson" },
  { id: 5, client: "Umbrella Corp", action: "New client onboarded", time: "3 days ago", user: "Robert Davis" }
];

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const FobcaDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FOBCA Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Monthly Summary
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalClients}</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              <span>{analyticsData.clientGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeClients}</div>
            <div className="flex items-center pt-1 text-xs">
              <span className="text-muted-foreground">{Math.round((analyticsData.activeClients / analyticsData.totalClients) * 100)}% activity rate</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              <span>{analyticsData.growthRate}% from last year</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.monthlyRevenue)}</div>
            <div className="flex items-center pt-1 text-xs">
              <span className="text-muted-foreground">Avg. {formatCurrency(analyticsData.averageClientRevenue)}/client</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              <BarChart3 className="h-32 w-32 text-muted-foreground" />
              <div className="text-center text-sm text-muted-foreground">
                Revenue chart visualization will appear here
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex flex-col justify-between">
              <div className="flex items-center justify-center mb-4">
                <PieChart className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span className="font-medium">Direct Clients</span>
                    <span className="ml-auto">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                    <span className="font-medium">Indirect Clients</span>
                    <span className="ml-auto">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-4">
                  Revenue: {formatCurrency(analyticsData.revenueByType.direct)} vs {formatCurrency(analyticsData.revenueByType.indirect)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Activities</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.client}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell className="text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {activity.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage client accounts, access controls, and onboarding.
            </p>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/fobca/client-management">
                  <Users className="mr-2 h-4 w-4" />
                  View All Clients
                </Link>
              </Button>
              <Button variant="outline" className="justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                Review Access Requests
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage FOBCA staff accounts and permission levels.
            </p>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/fobca/user-management">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Activity Logs
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure system-wide settings and preferences.
            </p>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/fobca/settings">
                  <Building className="mr-2 h-4 w-4" />
                  Company Settings
                </Link>
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                System Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FobcaDashboard;
