
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listener");

    const hardClearAuthStorage = () => {
      if (typeof window === "undefined") return;
      try {
        Object.keys(localStorage).forEach((key) => {
          // Supabase v2 stores sessions under sb-<project-ref>-auth-token
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
          // Back-compat / other providers
          if (key.startsWith("supabase.auth.")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn("Failed to hard-clear auth storage", e);
      }
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state change event:", event);

      if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing user and session state");
        setUser(null);
        setSession(null);
      } else {
        console.log(
          "Auth state changed, updating user and session",
          currentSession?.user?.email
        );
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }

      if (event === "SIGNED_IN" && currentSession?.user) {
        // Update user's last active timestamp
        setTimeout(() => {
          updateLastActive(currentSession.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    const initSession = async () => {
      try {
        console.log("Checking for existing session");
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        console.log(
          "Initial session check:",
          currentSession
            ? `Session found for ${currentSession.user.email}`
            : "No session"
        );

        if (currentSession?.user) {
          // Validate that the user still exists (handles deleted users w/ stale JWT)
          const { error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.warn("Session invalid; forcing sign-out:", userError);
            hardClearAuthStorage();
            await supabase.auth.signOut({ scope: "local" });
            setSession(null);
            setUser(null);
            toast({
              title: "Session expired",
              description: "Please sign in again.",
              variant: "destructive",
            });
            return;
          }

          setSession(currentSession);
          setUser(currentSession.user);
          updateLastActive(currentSession.user.id);
        } else {
          // Explicitly set null to ensure state is consistent
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initSession();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const updateLastActive = async (userId: string) => {
    try {
      const timestamp = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ last_active: timestamp })
        .eq('id', userId);
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
      
      // We don't need to set user/session here as the onAuthStateChange event will handle it
      return { success: true };
    } catch (error: any) {
      console.error("Unexpected signIn error:", error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    console.log("Signing out");
    try {
      // First, clear any local state
      setUser(null);
      setSession(null);
      
      // Then call Supabase signOut to clear tokens and session
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Make sure to clear all sessions across devices
      });
      
      if (error) {
        console.error("Error during sign out:", error.message);
        toast({
          title: "Sign out issue",
          description: "There was an issue signing you out completely. Your session might still be active.",
          variant: "destructive",
        });
      } else {
        console.log("Successfully signed out from Supabase");
      }
      
      // Force clear localStorage to ensure all tokens are removed
      if (typeof window !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
          if (key.startsWith("supabase.auth.")) {
            localStorage.removeItem(key);
          }
        });
      }
      
    } catch (error: any) {
      console.error("Unexpected error during sign out:", error);
      toast({
        title: "Sign out error",
        description: "An unexpected error occurred during sign out",
        variant: "destructive",
      });
    }
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
