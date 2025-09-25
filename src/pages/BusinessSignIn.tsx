
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Remove the mock businesses data since we're using real client data from database

const BusinessSignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { businessId } = useParams();

  // Load client data based on businessId
  useEffect(() => {
    const loadClientData = async () => {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        // Convert businessId back to business name (reverse of the URL conversion)
        const businessName = businessId.replace(/-/g, ' ');
        
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .ilike('business_name', businessName)
          .single();

        if (error) {
          console.error('Error loading client data:', error);
        } else {
          setClientData(data);
        }
      } catch (error) {
        console.error('Error in loadClientData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [businessId]);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setLoginError(null);
    const { email, password } = values;
    
    try {
      console.log("Attempting client signin...");
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      // Verify user is a client and has access to this business
      const { data: clientRecord, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (clientError || !clientRecord) {
        await supabase.auth.signOut();
        throw new Error("Access denied. This account is not associated with a client portal.");
      }

      // Check if trying to access the correct business portal
      if (businessId && clientRecord.business_name.toLowerCase().replace(/\s+/g, '-') !== businessId) {
        await supabase.auth.signOut();
        throw new Error("Access denied. You don't have permission to access this portal.");
      }

      toast({
        title: "Login successful",
        description: `Welcome to ${clientRecord.business_name} portal!`,
      });
      
      // Redirect to the client's specific portal
      const portalUrl = `/client/${clientRecord.business_name.toLowerCase().replace(/\s+/g, '-')}`;
      navigate(portalUrl, { replace: true });
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Invalid email or password. Please try again.");
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const businessName = clientData?.business_name || (businessId ? businessId.replace(/-/g, ' ') : 'Business');
  const primaryColor = "#4f46e5"; // Default color

  const buttonStyle = {
    backgroundColor: primaryColor,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/public/fobca-logo.png" 
              alt={`${businessName} Logo`} 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl">{businessName} Portal</CardTitle>
          <CardDescription>
            Sign in to access your business portal
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
              <Button 
                type="submit" 
                className="w-full text-white" 
                style={buttonStyle}
                disabled={isProcessing}
              >
                <LogIn className="mr-2 h-4 w-4" /> {isProcessing ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-center text-sm text-gray-600">
          <p>Forgot your password? Contact your administrator</p>
          <p className="text-xs text-center">
            Powered by <span className="font-semibold">FOBCA Bookkeeper</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BusinessSignIn;
