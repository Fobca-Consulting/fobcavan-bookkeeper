
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, session, loading } = useAuth();

  // Get the intended destination from location state or default to /fobca
  const from = location.state?.from || "/fobca";

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Function to determine where to redirect the user based on their role
  const getRedirectPath = async (userId: string) => {
    // First check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (roles?.some(r => r.role === 'admin')) {
      return '/fobca';
    }
    
    // Check if user is a client
    const { data: clientAccess } = await supabase
      .from('client_access')
      .select('client_id')
      .eq('user_id', userId)
      .single();
    
    if (clientAccess?.client_id) {
      return `/client/${clientAccess.client_id}`;
    }
    
    // Default fallback for other roles
    return '/fobca';
  };

  // Check for authenticated session and redirect if found
  useEffect(() => {
    console.log("SignIn auth state:", { loading, user, session, isProcessing });
    
    if (!loading && user && session) {
      console.log("User is authenticated, determining redirect...");
      
      // Determine the correct redirect path based on user role
      const handleRedirect = async () => {
        const redirectPath = await getRedirectPath(user.id);
        console.log("Redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
      };
      
      handleRedirect();
    }
  }, [user, session, loading, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setLoginError(null);
    const { email, password } = values;
    
    try {
      console.log("Attempting signin...");
      const { success, error } = await signIn(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to FOBCA Bookkeeper!"
        });
        console.log("Login successful, will redirect to:", from);
        // Don't navigate here - let the useEffect handle it to avoid race conditions
      } else {
        setLoginError(error || "Invalid email or password. Please try again.");
        toast({
          title: "Login failed",
          description: error || "Please check your credentials and try again",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError(err.message || "An unexpected error occurred");
      toast({
        title: "Login error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Default admin credentials hint
  const fillDefaultAdmin = () => {
    form.setValue("email", "admin@fobca.com");
    form.setValue("password", "admin123456");
  };

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated, show a brief loading before redirect happens
  if (!loading && user && session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Login successful, redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png" 
              alt="FOBCA Logo" 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the FOBCA Bookkeeper
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isProcessing}>
                <LogIn className="mr-2 h-4 w-4" /> {isProcessing ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              className="text-xs text-blue-600 hover:underline" 
              onClick={fillDefaultAdmin}
            >
              Use default admin credentials
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-600">
          Forgot your password? Contact your administrator
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
