import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: "draft" | "posted" | "reversed";
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
}

interface JournalLine {
  id: string;
  glCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

const mockAccounts = [
  { glCode: "1001", name: "Cash" },
  { glCode: "1200", name: "Accounts Receivable" },
  { glCode: "1300", name: "Inventory" },
  { glCode: "2001", name: "Accounts Payable" },
  { glCode: "4001", name: "Service Revenue" },
  { glCode: "5001", name: "Rent Expense" }
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: "JE-001",
    date: "2024-01-15",
    reference: "JE-001",
    description: "Monthly rent payment",
    status: "posted",
    totalDebit: 2000,
    totalCredit: 2000,
    lines: [
      {
        id: "1",
        glCode: "5001",
        accountName: "Rent Expense",
        description: "Monthly office rent",
        debit: 2000,
        credit: 0
      },
      {
        id: "2", 
        glCode: "1001",
        accountName: "Cash",
        description: "Payment for rent",
        debit: 0,
        credit: 2000
      }
    ]
  }
];

const JournalPosting = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    reference: "",
    description: "",
    lines: []
  });
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const addJournalLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      glCode: "",
      accountName: "",
      description: "",
      debit: 0,
      credit: 0
    };
    
    setCurrentEntry(prev => ({
      ...prev,
      lines: [...(prev.lines || []), newLine]
    }));
  };

  const updateJournalLine = (lineId: string, field: keyof JournalLine, value: any) => {
    setCurrentEntry(prev => ({
      ...prev,
      lines: (prev.lines || []).map(line => 
        line.id === lineId ? { ...line, [field]: value } : line
      )
    }));
  };

  const removeJournalLine = (lineId: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      lines: (prev.lines || []).filter(line => line.id !== lineId)
    }));
  };

  const handleAccountSelect = (lineId: string, glCode: string) => {
    const account = mockAccounts.find(acc => acc.glCode === glCode);
    if (account) {
      updateJournalLine(lineId, 'glCode', glCode);
      updateJournalLine(lineId, 'accountName', account.name);
    }
  };

  const calculateTotals = () => {
    const lines = currentEntry.lines || [];
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const isEntryBalanced = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    return totalDebit === totalCredit && totalDebit > 0;
  };

  const saveJournalEntry = () => {
    if (!isEntryBalanced()) {
      toast({
        title: "Entry Not Balanced",
        description: "Total debits must equal total credits.",
        variant: "destructive"
      });
      return;
    }

    const { totalDebit, totalCredit } = calculateTotals();
    const newEntry: JournalEntry = {
      id: `JE-${String(journalEntries.length + 1).padStart(3, '0')}`,
      date: currentEntry.date || new Date().toISOString().split('T')[0],
      reference: currentEntry.reference || `JE-${String(journalEntries.length + 1).padStart(3, '0')}`,
      description: currentEntry.description || "",
      status: "draft",
      totalDebit,
      totalCredit,
      lines: currentEntry.lines || []
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    
    toast({
      title: "Journal Entry Saved",
      description: "The journal entry has been saved as draft.",
    });

    setIsDialogOpen(false);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      reference: "",
      description: "",
      lines: []
    });
  };

  const postJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, status: "posted" as const } : entry
    ));
    
    toast({
      title: "Journal Entry Posted",
      description: "The journal entry has been posted to the general ledger.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted":
        return <Badge className="bg-green-100 text-green-800">Posted</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "reversed":
        return <Badge className="bg-red-100 text-red-800">Reversed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal Posting</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentEntry.date}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={currentEntry.reference}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="JE-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Journal entry description"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Journal Lines</h3>
                  <Button variant="outline" onClick={addJournalLine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GL Code</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(currentEntry.lines || []).map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Select
                            value={line.glCode}
                            onValueChange={(value) => handleAccountSelect(line.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockAccounts.map(account => (
                                <SelectItem key={account.glCode} value={account.glCode}>
                                  {account.glCode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{line.accountName}</TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(e) => updateJournalLine(line.id, 'description', e.target.value)}
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.debit || ""}
                            onChange={(e) => updateJournalLine(line.id, 'debit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.credit || ""}
                            onChange={(e) => updateJournalLine(line.id, 'credit', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeJournalLine(line.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Debits: </span>
                      <span className="text-green-600">{formatCurrency(totalDebit)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total Credits: </span>
                      <span className="text-red-600">{formatCurrency(totalCredit)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Balance: </span>
                      <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                        {isBalanced ? "Balanced ✓" : "Out of Balance"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveJournalEntry} disabled={!isEntryBalanced()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Journal Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Total Debit</TableHead>
                <TableHead>Total Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journalEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-medium">{entry.reference}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                  <TableCell>{formatCurrency(entry.totalCredit)}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    {entry.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => postJournalEntry(entry.id)}
                      >
                        Post
                      </Button>
                    )}
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

export default JournalPosting;