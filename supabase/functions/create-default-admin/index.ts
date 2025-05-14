
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
    const { data: existingAdmins, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (countError) throw countError;

    console.log("Existing admins:", existingAdmins?.length || 0);

    // Only create default admin if no admin users exist
    if (!existingAdmins || existingAdmins.length === 0) {
      const email = "admin@fobca.com";
      const password = "admin123456"; // More secure default password
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
      
      console.log("Default admin user created successfully:", data);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Default admin user created successfully",
        user: { email, fullName }
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
