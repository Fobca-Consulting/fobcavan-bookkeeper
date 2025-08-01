import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Building, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface FixedAsset {
  id: string;
  description: string;
  category: string;
  location: string;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLife: number;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  netBookValue: number;
  condition: "excellent" | "good" | "fair" | "poor";
  lastRevaluationDate?: string;
  revaluationAmount?: number;
}

// Sample fixed asset data
const sampleAssetData: FixedAsset[] = [
  {
    id: "FA001",
    description: "Dell OptiPlex Desktop Computer",
    category: "Computer Equipment",
    location: "Office - Accounting Department",
    acquisitionDate: "2022-01-15",
    acquisitionCost: 1200,
    usefulLife: 5,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 480,
    netBookValue: 720,
    condition: "good"
  },
  {
    id: "FA002",
    description: "Toyota Camry 2021",
    category: "Vehicles",
    location: "Company Parking Lot",
    acquisitionDate: "2021-03-10",
    acquisitionCost: 28000,
    usefulLife: 8,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 10500,
    netBookValue: 17500,
    condition: "excellent"
  },
  {
    id: "FA003",
    description: "Office Building - Main Floor",
    category: "Buildings",
    location: "123 Business St",
    acquisitionDate: "2018-06-01",
    acquisitionCost: 450000,
    usefulLife: 40,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 61875,
    netBookValue: 388125,
    condition: "good",
    lastRevaluationDate: "2023-06-01",
    revaluationAmount: 475000
  },
  {
    id: "FA004",
    description: "Manufacturing Equipment - CNC Machine",
    category: "Machinery",
    location: "Factory Floor A",
    acquisitionDate: "2020-09-15",
    acquisitionCost: 85000,
    usefulLife: 12,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 23611,
    netBookValue: 61389,
    condition: "excellent"
  },
  {
    id: "FA005",
    description: "Office Furniture Set",
    category: "Furniture & Fixtures",
    location: "Executive Office",
    acquisitionDate: "2019-11-20",
    acquisitionCost: 5500,
    usefulLife: 10,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 2292,
    netBookValue: 3208,
    condition: "good"
  },
  {
    id: "FA006",
    description: "Warehouse Forklift",
    category: "Machinery",
    location: "Warehouse B",
    acquisitionDate: "2017-04-12",
    acquisitionCost: 32000,
    usefulLife: 15,
    depreciationMethod: "Straight Line",
    accumulatedDepreciation: 14933,
    netBookValue: 17067,
    condition: "fair"
  }
];

const getConditionColor = (condition: string) => {
  switch (condition) {
    case "excellent": return "bg-green-100 text-green-800";
    case "good": return "bg-blue-100 text-blue-800";
    case "fair": return "bg-yellow-100 text-yellow-800";
    case "poor": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const calculateDepreciationRate = (asset: FixedAsset) => {
  return ((asset.accumulatedDepreciation / asset.acquisitionCost) * 100).toFixed(1);
};

const calculateAnnualDepreciation = (asset: FixedAsset) => {
  return asset.acquisitionCost / asset.usefulLife;
};

export const FixedAssetRegister = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-year");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");

  const categories = [...new Set(sampleAssetData.map(asset => asset.category))];

  const filteredData = sampleAssetData.filter(asset => {
    const matchesSearch = asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchesCondition = filterCondition === "all" || asset.condition === filterCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const totalAcquisitionCost = filteredData.reduce((sum, asset) => sum + asset.acquisitionCost, 0);
  const totalAccumulatedDepreciation = filteredData.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
  const totalNetBookValue = filteredData.reduce((sum, asset) => sum + asset.netBookValue, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Fixed Asset Register
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Complete inventory of company fixed assets with depreciation details
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
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="previous-year">Previous Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Acquisition Cost</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalAcquisitionCost)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Accumulated Depreciation</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalAccumulatedDepreciation)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Book Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalNetBookValue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fixed Asset Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Acquisition Date</TableHead>
                <TableHead>Acquisition Cost</TableHead>
                <TableHead>Useful Life</TableHead>
                <TableHead>Annual Depreciation</TableHead>
                <TableHead>Accumulated Depreciation</TableHead>
                <TableHead>Depreciation %</TableHead>
                <TableHead>Net Book Value</TableHead>
                <TableHead>Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono">{asset.id}</TableCell>
                  <TableCell className="font-medium min-w-[200px]">{asset.description}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell className="min-w-[150px]">{asset.location}</TableCell>
                  <TableCell>{asset.acquisitionDate}</TableCell>
                  <TableCell className="text-right">{formatCurrency(asset.acquisitionCost)}</TableCell>
                  <TableCell className="text-center">{asset.usefulLife} years</TableCell>
                  <TableCell className="text-right">{formatCurrency(calculateAnnualDepreciation(asset))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(asset.accumulatedDepreciation)}</TableCell>
                  <TableCell className="text-center">{calculateDepreciationRate(asset)}%</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(asset.netBookValue)}</TableCell>
                  <TableCell>
                    <Badge className={getConditionColor(asset.condition)}>
                      {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={5} className="text-right">Totals:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAcquisitionCost)}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{formatCurrency(totalAccumulatedDepreciation)}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{formatCurrency(totalNetBookValue)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No fixed assets found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};