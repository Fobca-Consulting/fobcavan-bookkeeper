
import React from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png" 
          alt="Fobca Logo" 
          className="h-8 w-auto mr-2"
        />
        <h1 className="text-xl font-semibold">Fobca Bookkeeper</h1>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
