
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import BankReconciliation from "./pages/BankReconciliation";
import MultiCurrency from "./pages/MultiCurrency";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import ClientOnboarding from "./pages/ClientOnboarding";
import BusinessSignIn from "./pages/BusinessSignIn";
import { SidebarProvider } from "./components/ui/sidebar";
import FobcaDashboard from "./pages/fobca/FobcaDashboard";
import FobcaLayout from "./components/FobcaLayout";
import UserManagement from "./pages/fobca/UserManagement";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientLayout from "./components/ClientLayout";
import ClientSettings from "./pages/client/ClientSettings";
import ClientUsers from "./pages/client/ClientUsers";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientManagement from "./pages/fobca/ClientManagement";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { setupDefaultAdmin } from "./utils/setupAdmin";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Call the setupDefaultAdmin function when the app starts
    setupDefaultAdmin()
      .then(success => {
        if (success) {
          console.log('Default admin setup completed');
        }
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/business-signin" element={<BusinessSignIn />} />
                <Route path="/business-signin/:businessId" element={<BusinessSignIn />} />
                <Route path="/onboarding" element={<ClientOnboarding />} />
                <Route path="/onboarding/:businessId" element={<ClientOnboarding />} />
                
                {/* FOBCA Admin Routes - Protected */}
                <Route path="/fobca" element={
                  <ProtectedRoute>
                    <FobcaLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<FobcaDashboard />} />
                  <Route path="client-management" element={<ClientManagement />} />
                  <Route path="user-management" element={<UserManagement />} />
                </Route>
                
                {/* Client Portal Routes - Protected */}
                <Route path="/client/:clientId" element={
                  <ProtectedRoute>
                    <ClientLayout />
                  </ProtectedRoute>
                }>
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
                
                {/* Redirect root to signin */}
                <Route path="/" element={<Navigate to="/signin" replace />} />
                
                {/* 404 for any other routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
