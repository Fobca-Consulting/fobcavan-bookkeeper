
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Save,
  Upload,
  User,
  Lock
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock businesses data - in a real app, this would come from a database
const businesses = [
  { 
    id: "acme", 
    name: "Acme Corporation", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png",
    email: "info@acmecorp.com",
    phone: "555-123-4567",
    website: "www.acmecorp.com",
    address: "123 Main St, San Francisco, CA 94105",
    fiscalYear: "January - December",
    taxId: "12-3456789",
    industry: "Manufacturing",
    founded: "1985",
    description: "Acme Corporation is a manufacturing company specializing in innovative products for various industries."
  },
  { 
    id: "globex", 
    name: "Globex Inc", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png",
    email: "contact@globex.com",
    phone: "555-987-6543",
    website: "www.globex.com",
    address: "456 Tech Blvd, Boston, MA 02110",
    fiscalYear: "July - June",
    taxId: "98-7654321",
    industry: "Technology",
    founded: "1992",
    description: "Globex Inc is a technology company developing cutting-edge solutions for global markets."
  }
];

const ClientSettings = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  
  // Find business data based on clientId
  const business = businesses.find(b => b.id === clientId) || businesses[0];

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your business settings have been updated",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Logo uploaded",
      description: "Your business logo has been updated",
    });
  };
  
  const handlePasswordChange = () => {
    toast({
      title: "Password updated",
      description: "Your password has been successfully changed",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{business.name} Settings</h1>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4 flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={business.logo} alt={business.name} />
                    <AvatarFallback className="text-2xl">{business.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" onClick={handleLogoUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Logo
                  </Button>
                </div>
                
                <div className="md:w-3/4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="business-name"
                          className="pl-10"
                          defaultValue={business.name}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="business-email">Business Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="business-email"
                          type="email"
                          className="pl-10"
                          defaultValue={business.email}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="business-phone">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="business-phone"
                          className="pl-10"
                          defaultValue={business.phone}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="business-website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="business-website"
                          className="pl-10"
                          defaultValue={business.website}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="business-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="business-address"
                        className="pl-10"
                        defaultValue={business.address}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-industry">Industry</Label>
                      <Input 
                        id="business-industry"
                        defaultValue={business.industry}
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-tax-id">Tax ID / EIN</Label>
                      <Input 
                        id="business-tax-id"
                        defaultValue={business.taxId}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="business-description">Business Description</Label>
                    <Textarea 
                      id="business-description"
                      className="min-h-[100px]"
                      defaultValue={business.description}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Update your account credentials and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account-email">Account Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="account-email"
                      type="email"
                      className="pl-10"
                      defaultValue={business.email}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">This email is used for account notifications and login</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="current-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="new-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="confirm-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange}>
                      Update Password
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure how the system works for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Fiscal Year Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fiscal-year">Fiscal Year</Label>
                      <Input 
                        id="fiscal-year"
                        defaultValue={business.fiscalYear}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fiscal-start">Fiscal Year Start</Label>
                      <Input 
                        id="fiscal-start"
                        type="month"
                        defaultValue="2023-01"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive email updates about account activity</p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Transaction Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified about new transactions</p>
                      </div>
                      <Switch id="transaction-alerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive monthly account summaries</p>
                      </div>
                      <Switch id="monthly-reports" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Display Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="date-format">Date Format</Label>
                      <select id="date-format" className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <select id="currency" className="w-full rounded-md border border-input bg-background px-3 py-2">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientSettings;
