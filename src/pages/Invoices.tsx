import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  MoreHorizontal,
  Calendar,
  FileText,
  Receipt
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

const invoiceData = [
  {
    id: "INV-2023-001",
    date: "2023-05-20",
    dueDate: "2023-06-19",
    client: "Acme Corporation",
    amount: 3500,
    status: "paid",
    type: "invoice"
  },
  {
    id: "INV-2023-002",
    date: "2023-05-25",
    dueDate: "2023-06-24",
    client: "Globex Inc.",
    amount: 2800,
    status: "pending",
    type: "invoice"
  },
  {
    id: "INV-2023-003",
    date: "2023-06-01",
    dueDate: "2023-07-01",
    client: "Wayne Enterprises",
    amount: 4200,
    status: "overdue",
    type: "invoice"
  }
];

const receiptData = [
  {
    id: "RCP-2023-001",
    date: "2023-05-22",
    client: "Acme Corporation",
    amount: 3500,
    paymentMethod: "Bank Transfer",
    type: "receipt"
  },
  {
    id: "RCP-2023-002",
    date: "2023-06-05",
    client: "Stark Industries",
    amount: 1500,
    paymentMethod: "Credit Card",
    type: "receipt"
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusStyle = (status: string) => {
  switch(status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Mock customers for dropdown
const mockCustomers = [
  { id: 1, name: "Acme Corporation" },
  { id: 2, name: "Globex Industries" },
  { id: 3, name: "Stark Enterprises" },
  { id: 4, name: "Wayne Industries" },
];

// Mock products for invoice items
const mockProducts = [
  { id: 1, name: "Consulting Services", price: 150.00 },
  { id: 2, name: "Web Development", price: 75.00 },
  { id: 3, name: "Graphic Design", price: 65.00 },
  { id: 4, name: "Marketing Services", price: 85.00 },
];

const InvoiceForm = ({ onClose }: { onClose: () => void }) => {
  const [items, setItems] = useState([
    { product: "", quantity: 1, unitPrice: 0, vatRate: 7.5, whtRate: 5.0, total: 0 }
  ]);

  const form = useForm({
    defaultValues: {
      customer: "",
      issueDate: "",
      dueDate: "",
      notes: "",
    },
  });

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, unitPrice: 0, vatRate: 7.5, whtRate: 5.0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for the item
    const item = updatedItems[index];
    const subtotal = item.quantity * item.unitPrice;
    const vat = subtotal * (item.vatRate / 100);
    const wht = subtotal * (item.whtRate / 100);
    updatedItems[index].total = subtotal + vat - wht;
    
    setItems(updatedItems);
  };

  const onSubmit = (data: any) => {
    console.log({ ...data, items });
    onClose();
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Invoice Items</FormLabel>
            <Button type="button" onClick={addItem} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product/Service</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>VAT %</TableHead>
                  <TableHead>WHT %</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select 
                        value={item.product} 
                        onValueChange={(value) => {
                          updateItem(index, "product", value);
                          const product = mockProducts.find(p => p.id.toString() === value);
                          if (product) {
                            updateItem(index, "unitPrice", product.price);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={item.vatRate}
                        onChange={(e) => updateItem(index, "vatRate", parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={item.whtRate}
                        onChange={(e) => updateItem(index, "whtRate", parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell>
                      {items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <div className="w-48 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Invoice</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const ReceiptForm = ({ onClose }: { onClose: () => void }) => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);

  const form = useForm({
    defaultValues: {
      customer: "",
      date: "",
      paymentMethod: "",
      amount: "",
      invoice: "",
      notes: "",
    },
  });

  // Mock invoices for selected customer
  const getCustomerInvoices = (customerId: string) => {
    const invoices = [
      { id: "INV-2023-001", customer: "1", amount: 3500, status: "unpaid" },
      { id: "INV-2023-002", customer: "2", amount: 2800, status: "unpaid" },
      { id: "INV-2023-003", customer: "4", amount: 4200, status: "unpaid" },
    ];
    return invoices.filter(inv => inv.customer === customerId && inv.status === "unpaid");
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    form.setValue("customer", customerId);
    const invoices = getCustomerInvoices(customerId);
    setCustomerInvoices(invoices);
    form.setValue("invoice", "");
    form.setValue("amount", "");
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = customerInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      form.setValue("amount", invoice.amount.toString());
    }
  };

  const onSubmit = (data: any) => {
    console.log(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={handleCustomerChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCustomer && (
          <FormField
            control={form.control}
            name="invoice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice (Optional)</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  handleInvoiceChange(value);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice to pay" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customerInvoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.id} - {formatCurrency(invoice.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Receipt</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("invoices");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"invoice" | "receipt">("invoice");

  const handleCreateInvoice = () => {
    setDialogType("invoice");
    setIsDialogOpen(true);
  };

  const handleCreateReceipt = () => {
    setDialogType("receipt");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices & Receipts</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateInvoice}>
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateReceipt}>
                <Receipt className="mr-2 h-4 w-4" />
                New Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Invoice & Receipt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by client or invoice number..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select defaultValue="this-month">
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Period" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Tabs defaultValue="invoices" className="mb-6" onValueChange={(value) => setActiveTab(value)}>
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Mark as Paid
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="receipts" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptData.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>{receipt.id}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell>{receipt.client}</TableCell>
                      <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                      <TableCell>{receipt.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing 1-{activeTab === "invoices" ? invoiceData.length : receiptData.length} of {activeTab === "invoices" ? invoiceData.length : receiptData.length} {activeTab}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "invoice" ? "Create New Invoice" : "Create New Receipt"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "invoice" 
                ? "Create a new invoice for your client. Fill in all the details below."
                : "Record a payment receipt. Fill in all the payment details below."
              }
            </DialogDescription>
          </DialogHeader>
          
          {dialogType === "invoice" 
            ? <InvoiceForm onClose={handleCloseDialog} /> 
            : <ReceiptForm onClose={handleCloseDialog} />
          }
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
