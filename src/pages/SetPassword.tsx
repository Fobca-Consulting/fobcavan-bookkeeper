import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      try {
        // Supabase recovery links use hash fragments, not query params
        // The auth state change will fire when a recovery link is clicked
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw error;
        }

        if (session) {
          // User has a valid session from the recovery link
          setIsValidToken(true);
          setUserEmail(session.user.email || null);
        } else {
          // Listen for auth state changes (recovery link will trigger this)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log("Auth event:", event);
              if (event === 'PASSWORD_RECOVERY' && session) {
                setIsValidToken(true);
                setUserEmail(session.user.email || null);
              } else if (event === 'SIGNED_IN' && session) {
                // Recovery link might trigger SIGNED_IN instead
                setIsValidToken(true);
                setUserEmail(session.user.email || null);
              }
            }
          );

          // Check URL hash for recovery token (Supabase format)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const type = hashParams.get("type");

          if (accessToken && type === "recovery") {
            // Set the session from the recovery token
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get("refresh_token") || "",
            });

            if (setSessionError) {
              console.error("Set session error:", setSessionError);
              throw setSessionError;
            }

            if (data.session) {
              setIsValidToken(true);
              setUserEmail(data.session.user.email || null);
            }
          } else if (!accessToken) {
            // No token in URL and no session
            toast({
              title: "Invalid Link",
              description: "This password setup link is invalid or has expired.",
              variant: "destructive",
            });
            setTimeout(() => navigate("/signin"), 3000);
          }

          return () => subscription.unsubscribe();
        }
      } catch (error) {
        console.error("Error validating recovery token:", error);
        toast({
          title: "Invalid Link",
          description: "This password setup link is invalid or has expired.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/signin"), 3000);
      } finally {
        setIsValidating(false);
      }
    };

    handlePasswordRecovery();
  }, [navigate]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Call activate-user edge function to update status to active
        const { error: activateError } = await supabase.functions.invoke('activate-user', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (activateError) {
          console.error("Error activating user:", activateError);
        }
      }

      toast({
        title: "Password Set Successfully",
        description: "Your password has been created. Redirecting to sign in...",
      });

      // Sign out and redirect to sign in
      await supabase.auth.signOut();
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error: any) {
      console.error("Error setting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating your link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This password setup link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>
            {userEmail ? `Create a secure password for ${userEmail}` : 'Create a secure password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Setting Password..." : "Set Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
