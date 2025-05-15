
import { Navigate, useLocation, useEffect } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("Protected Route Auth State:", { 
      user: !!user, 
      session: !!session, 
      loading, 
      path: location.pathname 
    });
  }, [user, session, loading, location.pathname]);

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

  // Redirect to login if not authenticated
  if (!user || !session) {
    console.log("Not authenticated, redirecting to signin with state:", location.pathname);
    
    // Using state to remember where the user was trying to go
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render the children
  console.log("User is authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
