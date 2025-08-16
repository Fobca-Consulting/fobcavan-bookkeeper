import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, Filter } from "lucide-react";

interface GLEntry {
  id: string;
  date: string;
  glCode: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

const mockGLEntries: GLEntry[] = [
  {
    id: "GL-001",
    date: "2024-01-15",
    glCode: "1001",
    description: "Cash Receipt from Customer",
    reference: "AR-1001",
    debit: 5000,
    credit: 0,
    balance: 54100
  },
  {
    id: "GL-002", 
    date: "2024-01-16",
    glCode: "1001",
    description: "Payment to Vendor",
    reference: "AP-2001",
    debit: 0,
    credit: 2500,
    balance: 51600
  },
  {
    id: "GL-003",
    date: "2024-01-17",
    glCode: "4001",
    description: "Service Revenue",
    reference: "INV-1001",
    debit: 0,
    credit: 3500,
    balance: 89000
  }
];

const GLPostingCallover = () => {
  const [entries] = useState<GLEntry[]>(mockGLEntries);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [glCode, setGlCode] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateInRange = (!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate);
    const glCodeMatch = !glCode || entry.glCode.includes(glCode);
    
    return dateInRange && glCodeMatch;
  });

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          GL Posting Callover
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="glCode">GL Code</Label>
            <Input
              id="glCode"
              placeholder="Enter GL Code"
              value={glCode}
              onChange={(e) => setGlCode(e.target.value)}
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button variant="outline" className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalDebits)}
              </div>
              <p className="text-sm text-muted-foreground">Total Debits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalCredits)}
              </div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {formatCurrency(totalDebits - totalCredits)}
              </div>
              <p className="text-sm text-muted-foreground">Net Movement</p>
            </CardContent>
          </Card>
        </div>

        {/* GL Entries Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>GL Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell className="font-medium">{entry.glCode}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.reference}</TableCell>
                <TableCell className="text-right">
                  {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(entry.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GLPostingCallover;