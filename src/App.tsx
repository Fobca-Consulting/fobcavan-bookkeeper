
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import BankReconciliation from "./pages/BankReconciliation";
import ClientPortal from "./pages/ClientPortal";
import ClientManagement from "./pages/ClientManagement";
import MultiCurrency from "./pages/MultiCurrency";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import ClientOnboarding from "./pages/ClientOnboarding";
import BusinessSignIn from "./pages/BusinessSignIn";
import { SidebarProvider } from "./components/ui/sidebar";
import Layout from "./components/Layout";
import FobcaDashboard from "./pages/fobca/FobcaDashboard";
import FobcaLayout from "./components/FobcaLayout";
import UserManagement from "./pages/fobca/UserManagement";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientLayout from "./components/ClientLayout";
import ClientSettings from "./pages/client/ClientSettings";
import ClientUsers from "./pages/client/ClientUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/business-signin" element={<BusinessSignIn />} />
            <Route path="/business-signin/:businessId" element={<BusinessSignIn />} />
            <Route path="/onboarding" element={<ClientOnboarding />} />
            <Route path="/onboarding/:businessId" element={<ClientOnboarding />} />
            
            {/* FOBCA Admin Routes */}
            <Route path="/fobca" element={<FobcaLayout />}>
              <Route index element={<FobcaDashboard />} />
              <Route path="client-management" element={<ClientManagement />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Client Portal Routes */}
            <Route path="/client/:clientId" element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="bank-reconciliation" element={<BankReconciliation />} />
              <Route path="multi-currency" element={<MultiCurrency />} />
              <Route path="settings" element={<ClientSettings />} />
              <Route path="users" element={<ClientUsers />} />
            </Route>
            
            {/* Legacy Routes - redirect to FOBCA dashboard */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="bank-reconciliation" element={<BankReconciliation />} />
              <Route path="client-portal" element={<ClientPortal />} />
              <Route path="client-management" element={<ClientManagement />} />
              <Route path="multi-currency" element={<MultiCurrency />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
