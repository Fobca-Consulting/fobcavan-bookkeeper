
import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ClientSidebar from "./ClientSidebar";
import Header from "./Header";

const ClientLayout = () => {
  const { clientId } = useParams();

  return (
    <div className="min-h-screen flex w-full">
      <ClientSidebar clientId={clientId} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
