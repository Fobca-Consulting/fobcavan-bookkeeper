import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Banknote, 
  PlusCircle, 
  RefreshCw, 
  Settings, 
  CalendarDays, 
  Globe, 
  TrendingUp 
} from "lucide-react";
import { CurrencyTable } from "@/components/multi-currency/CurrencyTable";
import { ExchangeRateCalculator } from "@/components/multi-currency/ExchangeRateCalculator";
import { CurrencyRateCards } from "@/components/multi-currency/CurrencyRateCards";
import { TransactionTable } from "@/components/multi-currency/TransactionTable";

// Mock currency data
const currencies = [
  { 
    code: "USD", 
    name: "US Dollar", 
    symbol: "$", 
    isBase: true, 
    exchangeRate: 1.0000,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "EUR", 
    name: "Euro", 
    symbol: "€", 
    isBase: false, 
    exchangeRate: 0.9236,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "GBP", 
    name: "British Pound", 
    symbol: "£", 
    isBase: false, 
    exchangeRate: 0.7964,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "CAD", 
    name: "Canadian Dollar", 
    symbol: "C$", 
    isBase: false, 
    exchangeRate: 1.3550,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "AUD", 
    name: "Australian Dollar", 
    symbol: "A$", 
    isBase: false, 
    exchangeRate: 1.5234,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "JPY", 
    name: "Japanese Yen", 
    symbol: "¥", 
    isBase: false, 
    exchangeRate: 139.7650,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "INR", 
    name: "Indian Rupee", 
    symbol: "₹", 
    isBase: false, 
    exchangeRate: 82.6450,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "NGN", 
    name: "Nigerian Naira", 
    symbol: "₦", 
    isBase: false, 
    exchangeRate: 1464.2500,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "ZAR", 
    name: "South African Rand", 
    symbol: "R", 
    isBase: false, 
    exchangeRate: 18.4530,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "KES", 
    name: "Kenyan Shilling", 
    symbol: "KSh", 
    isBase: false, 
    exchangeRate: 130.3520,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "GHS", 
    name: "Ghanaian Cedi", 
    symbol: "₵", 
    isBase: false, 
    exchangeRate: 15.2350,
    lastUpdated: "2023-05-26"
  },
  { 
    code: "EGP", 
    name: "Egyptian Pound", 
    symbol: "E£", 
    isBase: false, 
    exchangeRate: 47.8910,
    lastUpdated: "2023-05-26"
  },
];

// Mock recent transactions with currencies
const recentTransactions = [
  { 
    id: 1, 
    date: "2023-05-25", 
    description: "Sales Revenue", 
    originalCurrency: "EUR", 
    originalAmount: 5000.00,
    baseCurrency: "USD",
    baseAmount: 5400.00,
    type: "income"
  },
  { 
    id: 2, 
    date: "2023-05-22", 
    description: "Office Supplies", 
    originalCurrency: "USD", 
    originalAmount: 350.25,
    baseCurrency: "USD",
    baseAmount: 350.25,
    type: "expense"
  },
  { 
    id: 3, 
    date: "2023-05-20", 
    description: "International Vendor Payment", 
    originalCurrency: "GBP", 
    originalAmount: 2230.00,
    baseCurrency: "USD",
    baseAmount: 2800.10,
    type: "expense"
  },
  { 
    id: 4, 
    date: "2023-05-18", 
    description: "Service Export", 
    originalCurrency: "CAD", 
    originalAmount: 7500.00,
    baseCurrency: "USD",
    baseAmount: 5535.94,
    type: "income"
  },
  { 
    id: 5, 
    date: "2023-05-15", 
    description: "Software Subscription", 
    originalCurrency: "USD", 
    originalAmount: 99.00,
    baseCurrency: "USD",
    baseAmount: 99.00,
    type: "expense"
  },
];

const MultiCurrency = () => {
  const [activeTab, setActiveTab] = useState("currencies");
  const [autoUpdateRates, setAutoUpdateRates] = useState(true);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Multi-Currency Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Exchange Rates
          </Button>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Currency
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="currencies">
            <Banknote className="mr-2 h-4 w-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="exchange-rates">
            <TrendingUp className="mr-2 h-4 w-4" />
            Exchange Rates
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Globe className="mr-2 h-4 w-4" />
            Foreign Transactions
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="currencies" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Active Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Input
                    placeholder="Search currencies..."
                    className="pl-10 w-72"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
              
              <CurrencyTable currencies={currencies} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exchange-rates" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Exchange Rate Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-update Exchange Rates</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically update rates from external service
                      </p>
                    </div>
                    <Switch 
                      checked={autoUpdateRates}
                      onCheckedChange={setAutoUpdateRates}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Update Frequency</label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Button variant="outline" className="mr-2">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Now
                    </Button>
                    <Button variant="outline">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Rate Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>May 26, 2023 09:15 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Source:</span>
                      <span>Exchange Rate API</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Currency:</span>
                      <span>USD (US Dollar)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Currencies:</span>
                      <span>7</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <ExchangeRateCalculator currencies={currencies} />
              
              <h3 className="font-medium mb-4">Current Exchange Rates</h3>
              <CurrencyRateCards currencies={currencies} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Foreign Currency Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Input
                      placeholder="Search transactions..."
                      className="pl-10"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Currencies</SelectItem>
                        {currencies.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Select defaultValue="last30">
                      <SelectTrigger>
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last90">Last 90 Days</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <TransactionTable transactions={recentTransactions} currencies={currencies} />
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing 5 of 5 transactions
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
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Multi-Currency Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Base Currency Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Base Currency</label>
                        <Select defaultValue="USD">
                          <SelectTrigger>
                            <SelectValue placeholder="Select base currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          All foreign currency transactions will be converted to this currency for reporting
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Show Multi-Currency</h4>
                          <p className="text-sm text-muted-foreground">
                            Display original and base currency in reports
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Exchange Rate Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Exchange Rate Provider</label>
                        <Select defaultValue="api">
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api">Exchange Rate API</SelectItem>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Exchange Rate for New Transactions</label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue placeholder="Select rate type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily Rate</SelectItem>
                            <SelectItem value="transaction">Transaction Date Rate</SelectItem>
                            <SelectItem value="custom">Custom Rate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Exchange Gain/Loss Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Track exchange rate fluctuations 
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Display Settings</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Format for USD</label>
                        <Select defaultValue="$X">
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$X">$1,234.56</SelectItem>
                            <SelectItem value="X USD">1,234.56 USD</SelectItem>
                            <SelectItem value="$ X">$ 1,234.56</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Show Currency Symbol</h4>
                          <p className="text-sm text-muted-foreground">
                            Display currency symbols in reports
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Show Currency Code</h4>
                          <p className="text-sm text-muted-foreground">
                            Display 3-letter currency code in reports
                          </p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiCurrency;
