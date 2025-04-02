import React from "react";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  BarChart2,
  Settings,
  LogOut,
  Bank,
  Users,
  Globe,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AppSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <img 
          src="/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png" 
          alt="Fobca Logo" 
          className="h-8 w-auto mr-2"
        />
        <h1 className="text-lg font-semibold">Fobca Bookkeeper</h1>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
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
          to="/accounts"
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
          to="/invoices"
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
          to="/reports"
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
          to="/bank-reconciliation"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Bank className="h-4 w-4 mr-2" />
          Bank Reconciliation
        </NavLink>
        <NavLink
          to="/client-portal"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Users className="h-4 w-4 mr-2" />
          Client Portal
        </NavLink>
        <NavLink
          to="/multi-currency"
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
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-primary text-white">FB</AvatarFallback>
          </Avatar>
          Sign Out
          <LogOut className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
