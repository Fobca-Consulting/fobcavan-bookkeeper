
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

const handler = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json().catch(() => ({}));
    const forceCreate = body.force === true;
    
    console.log("Force create mode:", forceCreate);
    
    // Check if admin user already exists
    const { data: existingAdmins, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (countError) throw countError;

    console.log("Existing admins:", existingAdmins?.length || 0);

    // If force create, delete existing admin users first
    if (forceCreate && existingAdmins && existingAdmins.length > 0) {
      console.log("Force mode: Deleting existing admin users...");
      
      // Delete from auth.users first
      for (const admin of existingAdmins) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(admin.id);
          console.log(`Deleted admin user: ${admin.id}`);
        } catch (deleteError) {
          console.error(`Error deleting admin user ${admin.id}:`, deleteError);
        }
      }
      
      // Delete from profiles table
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('role', 'admin');
        
      if (profileDeleteError) {
        console.error("Error deleting admin profiles:", profileDeleteError);
      }
    }

    // Create default admin if no admin users exist OR if force create is requested
    if (!existingAdmins || existingAdmins.length === 0 || forceCreate) {
      const email = "admin@fobca.com";
      const password = "admin123456";
      const fullName = "Admin User";
      
      console.log("Creating new admin user with email:", email);
      
      // Create the admin user with email already confirmed
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        throw error;
      }
      
      console.log("Admin user created in auth, ID:", data.user?.id);
      
      // Also update the profiles table directly to ensure the role is set
      if (data.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            role: 'admin',
            active: true
          });
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }
        
        console.log("Admin profile created successfully");
      }
      
      console.log("Default admin user created successfully:", data);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: forceCreate ? "Admin user force created successfully" : "Default admin user created successfully",
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
