
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  // Supabase API URL - env var exported by default.
  Deno.env.get("SUPABASE_URL") ?? "",
  // Supabase SERVICE ROLE KEY - env var exported by default.
  // The service key has admin rights, so it can create users.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (_req: Request): Promise<Response> => {
  try {
    // Check if admin user already exists
    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (countError) throw countError;

    // Only create default admin if no admin users exist
    if (count === 0) {
      const email = "oluwafemi.olukoya@gmail.com";
      const password = "adminpassword"; // In production, this should be a secure random password
      const fullName = "Admin User";
      
      // Create the admin user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      });
      
      if (error) throw error;
      
      console.log("Default admin user created successfully");
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Default admin user created successfully" 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Admin user already exists" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating default admin user:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
