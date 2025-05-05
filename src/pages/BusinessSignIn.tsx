
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

// Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Mock business data - in a real app this would come from a database
const businesses = [
  { 
    id: "acme", 
    name: "Acme Corporation", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png",
    primaryColor: "#4f46e5"
  },
  { 
    id: "globex", 
    name: "Globex Inc", 
    logo: "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png",
    primaryColor: "#10b981"
  }
];

const BusinessSignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useParams();

  // Find business data based on businessId
  const businessData = businessId 
    ? businesses.find(b => b.id === businessId) 
    : businesses[0]; // Default to first business if no ID provided

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Business login values:", values);
    
    // For now, we'll simulate a successful login
    toast({
      title: "Login successful",
      description: `Welcome to ${businessData?.name || 'FOBCA Bookkeeper'}!`,
    });
    
    // Redirect to dashboard
    navigate("/");
  };

  const buttonStyle = {
    backgroundColor: businessData?.primaryColor || "#4f46e5",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={businessData?.logo || "/lovable-uploads/c66906f4-c804-47cb-a92a-164a88f1e0d4.png"} 
              alt={`${businessData?.name || 'Business'} Logo`} 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl">{businessData?.name || 'Business'} Portal</CardTitle>
          <CardDescription>
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign In
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
