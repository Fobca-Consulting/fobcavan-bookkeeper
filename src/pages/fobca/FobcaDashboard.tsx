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
import { useFobcaDashboard } from "@/hooks/useFobcaDashboard";
import { useClientActivities } from "@/hooks/useClientActivities";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const FobcaDashboard = () => {
  const { stats, loading: statsLoading } = useFobcaDashboard();
  const { activities, loading: activitiesLoading } = useClientActivities();

  const activityRate = stats.totalClients > 0 
    ? Math.round((stats.activeClients / stats.totalClients) * 100) 
    : 0;

  const averageClientRevenue = stats.totalClients > 0 
    ? stats.totalRevenue / stats.totalClients 
    : 0;

  const directPercentage = stats.totalClients > 0 
    ? Math.round((stats.directClients / stats.totalClients) * 100) 
    : 0;

  const indirectPercentage = 100 - directPercentage;

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
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats.totalClients}
            </div>
            <div className="flex items-center pt-1 text-xs">
              {stats.clientGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {stats.clientGrowth.toFixed(1)}% from last month
                </span>
              ) : stats.clientGrowth < 0 ? (
                <span className="text-red-500 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  {Math.abs(stats.clientGrowth).toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-muted-foreground">No change</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats.activeClients}
            </div>
            <div className="flex items-center pt-1 text-xs">
              <span className="text-muted-foreground">
                {activityRate}% activity rate
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center pt-1 text-xs">
              {stats.revenueGrowth > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {stats.revenueGrowth.toFixed(1)}% from last month
                </span>
              ) : stats.revenueGrowth < 0 ? (
                <span className="text-red-500 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  {Math.abs(stats.revenueGrowth).toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-muted-foreground">No change</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats.monthlyRevenue)}
            </div>
            <div className="flex items-center pt-1 text-xs">
              <span className="text-muted-foreground">
                Avg. {formatCurrency(averageClientRevenue)}/client
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview (Past 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[240px] flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.monthlyRevenueByMonth}>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {stats.monthlyRevenueByMonth.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[240px] flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <div className="h-[240px] flex flex-col justify-between">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="20"
                        strokeDasharray={`${directPercentage * 2.51}, 251`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="20"
                        strokeDasharray={`${indirectPercentage * 2.51}, 251`}
                        strokeDashoffset={`-${directPercentage * 2.51}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      <span className="font-medium">Direct Clients</span>
                      <span className="ml-auto">{stats.directClients} ({directPercentage}%)</span>
                    </div>
                    <Progress value={directPercentage} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                      <span className="font-medium">Indirect Clients</span>
                      <span className="ml-auto">{stats.indirectClients} ({indirectPercentage}%)</span>
                    </div>
                    <Progress value={indirectPercentage} className="h-2" />
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-4">
                    Revenue: {formatCurrency(stats.directRevenue)} vs {formatCurrency(stats.indirectRevenue)}
                  </div>
                </div>
              </div>
            )}
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
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No recent activities</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium capitalize">{activity.action_type}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className="text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
