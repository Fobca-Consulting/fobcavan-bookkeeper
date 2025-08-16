import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, TrendingUp, Banknote, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  bankAccount: string;
  amount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  status: "active" | "matured" | "liquidated";
  accruedInterest: number;
}

const mockInvestments: Investment[] = [
  {
    id: "INV-001",
    bankAccount: "First National Bank",
    amount: 100000,
    interestRate: 5.5,
    startDate: "2024-01-01",
    maturityDate: "2024-12-31",
    status: "active",
    accruedInterest: 4583.33
  },
  {
    id: "INV-002", 
    bankAccount: "Capital Bank",
    amount: 50000,
    interestRate: 4.8,
    startDate: "2023-06-01",
    maturityDate: "2024-06-01",
    status: "matured",
    accruedInterest: 2400
  }
];

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleLiquidate = (id: string) => {
    setInvestments(prev => 
      prev.map(inv => 
        inv.id === id ? { ...inv, status: "liquidated" as const } : inv
      )
    );
    toast({
      title: "Investment Liquidated",
      description: "The investment has been successfully liquidated and funds transferred to the bank account.",
    });
  };

  const handleRollover = (id: string) => {
    setInvestments(prev => 
      prev.map(inv => 
        inv.id === id ? { 
          ...inv, 
          startDate: new Date().toISOString().split('T')[0],
          maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          accruedInterest: 0,
          status: "active" as const
        } : inv
      )
    );
    toast({
      title: "Investment Rolled Over",
      description: "The investment has been rolled over for another term.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "matured":
        return <Badge className="bg-yellow-100 text-yellow-800">Matured</Badge>;
      case "liquidated":
        return <Badge className="bg-red-100 text-red-800">Liquidated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Investment Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Investment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Account</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fnb">First National Bank</SelectItem>
                    <SelectItem value="capital">Capital Bank</SelectItem>
                    <SelectItem value="metro">Metro Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount</Label>
                <Input id="amount" type="number" placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Interest Rate (%)</Label>
                <Input id="rate" type="number" step="0.1" placeholder="5.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Investment Term (months)</Label>
                <Input id="term" type="number" placeholder="12" />
              </div>
              <Button className="w-full">Create Investment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accrued Interest</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(investments.reduce((sum, inv) => sum + inv.accruedInterest, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investments.filter(inv => inv.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investment ID</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Principal Amount</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Maturity Date</TableHead>
                <TableHead>Accrued Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.id}</TableCell>
                  <TableCell>{investment.bankAccount}</TableCell>
                  <TableCell>{formatCurrency(investment.amount)}</TableCell>
                  <TableCell>{investment.interestRate}%</TableCell>
                  <TableCell>{investment.startDate}</TableCell>
                  <TableCell>{investment.maturityDate}</TableCell>
                  <TableCell>{formatCurrency(investment.accruedInterest)}</TableCell>
                  <TableCell>{getStatusBadge(investment.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {investment.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLiquidate(investment.id)}
                        >
                          Liquidate
                        </Button>
                      )}
                      {investment.status === "matured" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLiquidate(investment.id)}
                          >
                            Liquidate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollover(investment.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Rollover
                          </Button>
                        </>
                      )}
                    </div>
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

export default Investments;