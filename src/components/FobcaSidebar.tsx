
import React from "react";
import {
  LayoutDashboard,
  LogOut,
  Users,
  UserCog
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const FobcaSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    // In a real app, this would handle authentication logout
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    navigate("/signin");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <img 
          src="/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png" 
          alt="FOBCA Logo" 
          className="h-8 w-auto mr-2"
        />
        <h1 className="text-lg font-semibold">FOBCA Admin</h1>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavLink
          to="/fobca"
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
          to="/fobca/client-management"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <Users className="h-4 w-4 mr-2" />
          Client Management
        </NavLink>
        <NavLink
          to="/fobca/user-management"
          className={({ isActive }) =>
            `flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 ${
              isActive ? "bg-gray-100 text-primary" : "text-gray-700"
            }`
          }
        >
          <UserCog className="h-4 w-4 mr-2" />
          User Management
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
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

export default FobcaSidebar;
