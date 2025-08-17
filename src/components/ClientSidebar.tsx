
import React from "react";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  BarChart2,
  Settings,
  LogOut,
  Building,
  Users,
  Globe,
  User,
  Briefcase,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Mock businesses data - in a real app, this would come from a database
const businesses = [
  { 
    id: "acme", 
    name: "Acme Corporation", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png"
  },
  { 
    id: "globex", 
    name: "Globex Inc", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png"
  }
];

interface ClientSidebarProps {
  clientId?: string;
}

const ClientSidebar = ({ clientId = 'acme' }: ClientSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  // Find business data based on clientId
  const businessData = businesses.find(b => b.id === clientId) || businesses[0];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/business-signin");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <img 
          src={businessData.logo}
          alt={`${businessData.name} Logo`} 
          className="h-8 w-auto mr-2"
        />
        <h1 className="text-lg font-semibold">{businessData.name}</h1>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavLink
          to={`/client/${clientId}`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
          end
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </NavLink>
        <NavLink
          to={`/client/${clientId}/transactions`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          Transactions
        </NavLink>
        <NavLink
          to={`/client/${clientId}/accounts`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Wallet className="h-4 w-4 mr-2" />
          Accounts
        </NavLink>
        <NavLink
          to={`/client/${clientId}/customers`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <User className="h-4 w-4 mr-2" />
          Customers
        </NavLink>
        <NavLink
          to={`/client/${clientId}/vendors`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Vendors
        </NavLink>
        <NavLink
          to={`/client/${clientId}/invoices`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          Invoices
        </NavLink>
        <NavLink
          to={`/client/${clientId}/reports`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Reports
        </NavLink>
        <NavLink
          to={`/client/${clientId}/bank-reconciliation`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Building className="h-4 w-4 mr-2" />
          Bank Reconciliation
        </NavLink>
        <NavLink
          to={`/client/${clientId}/multi-currency`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Globe className="h-4 w-4 mr-2" />
          Multi-Currency
        </NavLink>
        <NavLink
          to={`/client/${clientId}/investments`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Investments
        </NavLink>
        <NavLink
          to={`/client/${clientId}/chart-of-accounts`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Chart of Accounts
        </NavLink>
        <NavLink
          to={`/client/${clientId}/journal-posting`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          Journal Posting
        </NavLink>
        <NavLink
          to={`/client/${clientId}/settings`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </NavLink>
        <NavLink
          to={`/client/${clientId}/users`}
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-primary text-white">
              {businessData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          Sign Out
          <LogOut className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
