
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  resetPassword: (password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProfile: (data: { full_name?: string; role?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        
        // Only synchronous state updates here
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN') {
          // Update user's last active timestamp
          setTimeout(() => {
            updateLastActive();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log("Initial session check:", currentSession ? "Session found" : "No session");
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          updateLastActive();
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const updateLastActive = async () => {
    if (!user) return;

    try {
      const timestamp = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ last_active: timestamp })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating last active timestamp:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting signIn with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("SignIn error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("SignIn successful:", data.user?.email);
      return { success: true };
    } catch (error: any) {
      console.error("Unexpected signIn error:", error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    console.log("Signing out");
    await supabase.auth.signOut();
    // Clear state explicitly to ensure consistent behavior
    setUser(null);
    setSession(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (data: { full_name?: string; role?: string }) => {
    try {
      if (!user) {
        return { success: false, error: "No user logged in" };
      }

      // Update user metadata if full_name is provided
      if (data.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: data.full_name },
        });
      }

      // Update profile data in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
