import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useAdvancedCustomers } from '@/hooks/useAdvancedCustomers';
import { formatCurrency } from '@/lib/utils';

const AdvancedCustomerCenter = () => {
  const {
    customers,
    communications,
    statements,
    loading,
    addCommunication,
    generateStatement,
    checkCreditLimit,
    getFollowUpCustomers,
    getAgingReport,
  } = useAdvancedCustomers();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [communicationDialog, setCommunicationDialog] = useState(false);
  const [statementDialog, setStatementDialog] = useState(false);

  const [communicationForm, setCommunicationForm] = useState({
    type: 'note' as const,
    subject: '',
    content: '',
    scheduled_date: '',
  });

  const followUpCustomers = getFollowUpCustomers();
  const agingReport = getAgingReport();

  const handleAddCommunication = async () => {
    if (!selectedCustomer || !communicationForm.content) return;

    try {
      await addCommunication({
        customer_id: selectedCustomer.id,
        communication_type: communicationForm.type,
        subject: communicationForm.subject,
        content: communicationForm.content,
        scheduled_date: communicationForm.scheduled_date || undefined,
        status: 'completed',
      });

      setCommunicationDialog(false);
      setCommunicationForm({
        type: 'note',
        subject: '',
        content: '',
        scheduled_date: '',
      });
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  };

  const handleGenerateStatement = async () => {
    if (!selectedCustomer) return;

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    try {
      await generateStatement(
        selectedCustomer.id,
        lastMonth.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setStatementDialog(false);
    } catch (error) {
      console.error('Error generating statement:', error);
    }
  };

  const getCustomerStatusBadge = (customer: any) => {
    const creditCheck = checkCreditLimit(customer);
    
    if (customer.status === 'suspended') return { variant: 'destructive', label: 'Suspended' };
    if (customer.status === 'inactive') return { variant: 'secondary', label: 'Inactive' };
    if (!creditCheck.withinLimit) return { variant: 'destructive', label: 'Over Limit' };
    if (creditCheck.availableCredit < 1000) return { variant: 'warning', label: 'Near Limit' };
    return { variant: 'success', label: 'Active' };
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'wholesale': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Center</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{customers.filter(c => c.status === 'active').length} Active</span>
              <span>{customers.filter(c => c.status === 'inactive').length} Inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.current_balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding balances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Required</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{followUpCustomers.length}</div>
            <p className="text-xs text-muted-foreground">Customers needing attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (customers.reduce((sum, c) => sum + c.current_balance, 0) /
                customers.reduce((sum, c) => sum + c.credit_limit, 0)) * 100
              )}%
            </div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Customer Overview</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Customer Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Available Credit</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => {
                    const creditCheck = checkCreditLimit(customer);
                    const statusBadge = getCustomerStatusBadge(customer);
                    
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.customer_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCustomerTypeColor(customer.customer_type)}>
                            {customer.customer_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(customer.credit_limit)}</TableCell>
                        <TableCell>
                          <span className={customer.current_balance > 0 ? 'text-orange-600 font-medium' : ''}>
                            {formatCurrency(customer.current_balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={creditCheck.availableCredit < 1000 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {formatCurrency(creditCheck.availableCredit)}
                          </span>
                        </TableCell>
                        <TableCell>{customer.payment_terms_days} days</TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>{customer.name} - Customer Details</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-2">Contact Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>Email: {customer.email || 'N/A'}</div>
                                      <div>Phone: {customer.phone || 'N/A'}</div>
                                      <div>Address: {customer.address || 'N/A'}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Financial Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>Credit Limit: {formatCurrency(customer.credit_limit)}</div>
                                      <div>Current Balance: {formatCurrency(customer.current_balance)}</div>
                                      <div>Payment Terms: {customer.payment_terms_days} days</div>
                                      <div>Discount: {customer.discount_percentage}%</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => setCommunicationDialog(true)}
                                    size="sm"
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Add Communication
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => setStatementDialog(true)}
                                    size="sm"
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Statement
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-30 Days</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingReport.map((report) => (
                    <TableRow key={report.customer_id}>
                      <TableCell className="font-medium">{report.customer_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.current)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.days_30)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.days_60)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.days_90)}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatCurrency(report.over_90)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(report.total_due)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Customer Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>{new Date(comm.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {customers.find(c => c.id === comm.customer_id)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {comm.communication_type === 'email' && <Mail className="h-4 w-4" />}
                          {comm.communication_type === 'phone' && <Phone className="h-4 w-4" />}
                          {comm.communication_type === 'meeting' && <Calendar className="h-4 w-4" />}
                          {comm.communication_type === 'note' && <MessageSquare className="h-4 w-4" />}
                          <span className="capitalize">{comm.communication_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{comm.subject || 'No subject'}</TableCell>
                      <TableCell>
                        <Badge variant={comm.status === 'completed' ? 'success' : 'default'}>
                          {comm.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Customer Statements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statement Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Total Charges</TableHead>
                    <TableHead className="text-right">Total Payments</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell>{new Date(statement.statement_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {customers.find(c => c.id === statement.customer_id)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(statement.from_date).toLocaleDateString()} - {' '}
                        {new Date(statement.to_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(statement.total_charges)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(statement.total_payments)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(statement.closing_balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statement.status === 'sent' ? 'success' : 'default'}>
                          {statement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Download</Button>
                          {statement.status === 'draft' && (
                            <Button size="sm">Send</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="follow-ups">
          <Card>
            <CardHeader>
              <CardTitle>Customers Requiring Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              {followUpCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers require follow-up at this time.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Current Balance</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUpCustomers.map((customer) => {
                      const creditCheck = checkCreditLimit(customer);
                      const issue = customer.status === 'suspended' ? 'Suspended Account' : 'Over Credit Limit';
                      const priority = customer.status === 'suspended' ? 'High' : 'Medium';
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{issue}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(customer.current_balance)}</TableCell>
                          <TableCell>{formatCurrency(customer.credit_limit)}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Badge variant={priority === 'High' ? 'destructive' : 'warning'}>
                              {priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Contact</Button>
                              <Button size="sm">Resolve</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Communication Dialog */}
      <Dialog open={communicationDialog} onOpenChange={setCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Communication</DialogTitle>
            <DialogDescription>
              Log a communication with {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select 
              value={communicationForm.type} 
              onValueChange={(value: any) => setCommunicationForm({...communicationForm, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Subject"
              value={communicationForm.subject}
              onChange={(e) => setCommunicationForm({...communicationForm, subject: e.target.value})}
            />
            <Textarea
              placeholder="Content"
              value={communicationForm.content}
              onChange={(e) => setCommunicationForm({...communicationForm, content: e.target.value})}
            />
            <Input
              type="datetime-local"
              value={communicationForm.scheduled_date}
              onChange={(e) => setCommunicationForm({...communicationForm, scheduled_date: e.target.value})}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommunicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCommunication}>
              Add Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={statementDialog} onOpenChange={setStatementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Statement</DialogTitle>
            <DialogDescription>
              Generate a statement for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This will generate a statement for the last month period.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateStatement}>
              Generate Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedCustomerCenter;