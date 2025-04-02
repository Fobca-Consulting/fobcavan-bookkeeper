
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bank, Users, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="text-center mb-10">
        <img 
          src="/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png" 
          alt="Fobca Logo" 
          className="mx-auto mb-4 h-32 w-auto"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to Fobca Bookkeeper</h1>
        <p className="text-xl text-gray-600 mb-8">Manage your finances with ease</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link to="/bank-reconciliation" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Bank Reconciliation</CardTitle>
              <Bank className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Match bank statements with your records to ensure accuracy in your accounts.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/client-portal" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Client Portal</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Securely share documents and information with your clients.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/multi-currency" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Multi-Currency</CardTitle>
              <Globe className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage transactions in multiple currencies with automatic exchange rate updates.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;
