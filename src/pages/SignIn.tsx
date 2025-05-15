
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

// Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, loading } = useAuth();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Check for authenticated session and redirect if found
  useEffect(() => {
    if (!loading && session && !isRedirecting) {
      setIsRedirecting(true);
      // Prevent immediate redirect to avoid loops
      const timer = setTimeout(() => {
        navigate("/fobca");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, loading, navigate, isRedirecting]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isRedirecting) return;
    
    setLoginError(null);
    const { email, password } = values;
    
    const { success, error } = await signIn(email, password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back to FOBCA Bookkeeper!"
      });
      setIsRedirecting(true);
      // Use a short delay to allow state to update properly
      setTimeout(() => {
        navigate("/fobca");
      }, 100);
    } else {
      setLoginError(error || "Invalid email or password. Please try again.");
      toast({
        title: "Login failed",
        description: error || "Please check your credentials and try again",
        variant: "destructive"
      });
    }
  };
  
  // Default admin credentials hint
  const fillDefaultAdmin = () => {
    form.setValue("email", "admin@fobca.com");
    form.setValue("password", "admin123456");
  };

  // If already authenticated and not on the redirect path, prevent rendering the login form
  if (!loading && session && location.pathname === "/signin") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
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
              <Button type="submit" className="w-full" disabled={isRedirecting}>
                <LogIn className="mr-2 h-4 w-4" /> {isRedirecting ? 'Signing In...' : 'Sign In'}
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
