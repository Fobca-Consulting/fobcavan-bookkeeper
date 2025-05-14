
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseAdmin = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase SERVICE ROLE KEY - env var exported by default.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface CreateUserRequest {
  email: string;
  password?: string;
  email_confirm?: boolean;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const userDetails: CreateUserRequest = await req.json();
    
    console.log("Creating user with details:", JSON.stringify({
      ...userDetails,
      password: userDetails.password ? "[REDACTED]" : null
    }));
    
    // Create the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userDetails.email,
      password: userDetails.password || null,
      email_confirm: userDetails.email_confirm || false,
      user_metadata: userDetails.user_metadata || {}
    });
    
    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }
    
    console.log("User created successfully:", data.user.id);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "User created successfully",
      userId: data.user.id
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error in admin-create-user function:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
};

serve(handler);
