
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log("Protected Route Auth State:", { user, session, loading, redirecting, path: location.pathname });
  }, [user, session, loading, redirecting, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Prevent multiple redirects
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !session) {
    console.log("Not authenticated, redirecting to signin with state:", location.pathname);
    
    // Prevent multiple redirects by setting redirecting state
    setRedirecting(true);
    
    // Using state to remember where the user was trying to go
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render the children
  console.log("User is authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
