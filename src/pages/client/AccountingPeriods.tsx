import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Lock, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useAccountingPeriods } from "@/hooks/useAccountingPeriods";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const AccountingPeriods = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { periods, loading, closePeriod } = useAccountingPeriods(clientId);
  
  const [closePeriodOpen, setClosePeriodOpen] = useState(false);
  const [periodYear, setPeriodYear] = useState(new Date().getFullYear().toString());
  const [periodMonth, setPeriodMonth] = useState((new Date().getMonth() + 1).toString());
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const quarters = [
    { value: '1', label: 'Q1 (Jan-Mar)' },
    { value: '2', label: 'Q2 (Apr-Jun)' },
    { value: '3', label: 'Q3 (Jul-Sep)' },
    { value: '4', label: 'Q4 (Oct-Dec)' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const calculatePeriodDates = () => {
    const year = parseInt(periodYear);
    let startDate: Date;
    let endDate: Date;

    if (periodType === 'monthly') {
      const month = parseInt(periodMonth) - 1;
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else if (periodType === 'quarterly') {
      const quarter = parseInt(periodMonth);
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const handleClosePeriod = async () => {
    setIsClosing(true);
    const { startDate, endDate } = calculatePeriodDates();
    
    const result = await closePeriod(startDate, endDate, notes);
    
    if (!result.error) {
      setClosePeriodOpen(false);
      setNotes("");
    }
    setIsClosing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accounting Periods</h1>
          <p className="text-muted-foreground">Manage accounting period closures</p>
        </div>
        <Dialog open={closePeriodOpen} onOpenChange={setClosePeriodOpen}>
          <DialogTrigger asChild>
            <Button>
              <Lock className="mr-2 h-4 w-4" />
              Close Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Accounting Period</DialogTitle>
              <DialogDescription>
                Closing a period will make all transactions within that date range read-only. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Period Type</Label>
                <Select value={periodType} onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setPeriodType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={periodYear} onValueChange={setPeriodYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {periodType !== 'yearly' && (
                  <div className="space-y-2">
                    <Label>{periodType === 'monthly' ? 'Month' : 'Quarter'}</Label>
                    <Select value={periodMonth} onValueChange={setPeriodMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(periodType === 'monthly' ? months : quarters).map(item => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Warning:</strong> All transactions from{' '}
                  {calculatePeriodDates().startDate} to {calculatePeriodDates().endDate}{' '}
                  will become read-only and cannot be edited or deleted.
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this period closure..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClosePeriodOpen(false)}>Cancel</Button>
              <Button onClick={handleClosePeriod} disabled={isClosing}>
                {isClosing ? "Closing..." : "Close Period"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Closed Periods</CardTitle>
          <CardDescription>
            Transactions in closed periods are read-only and cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accounting periods have been closed yet.</p>
              <p className="text-sm">Close a period to make transactions immutable.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closed At</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {format(new Date(period.period_start), 'MMM yyyy')} - {format(new Date(period.period_end), 'MMM yyyy')}
                    </TableCell>
                    <TableCell>{period.period_start}</TableCell>
                    <TableCell>{period.period_end}</TableCell>
                    <TableCell>
                      <Badge variant={period.status === 'closed' ? 'destructive' : 'secondary'}>
                        <Lock className="h-3 w-3 mr-1" />
                        {period.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {period.closed_at ? format(new Date(period.closed_at), 'PPp') : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {period.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingPeriods;
