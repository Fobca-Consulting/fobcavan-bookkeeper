
import React from "react";
import { Outlet } from "react-router-dom";
import FobcaSidebar from "./FobcaSidebar";
import Header from "./Header";

const FobcaLayout = () => {
  return (
    <div className="min-h-screen flex w-full">
      <FobcaSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FobcaLayout;
