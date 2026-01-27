import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const forceCreate = body.force === true;
    
    const email = "admin@fobca.com";
    const password = "admin123456";
    const fullName = "Admin User";
    
    console.log("Force create mode:", forceCreate);
    
    // First, check if user exists by email using admin API
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }
    
    const existingAdmin = existingUsers?.users?.find(u => u.email === email);
    
    if (existingAdmin) {
      if (!forceCreate) {
        console.log("Admin user already exists, skipping creation");
        return new Response(JSON.stringify({ 
          success: true,
          message: "Admin user already exists" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Force create: delete existing user first
      console.log("Force mode: Deleting existing admin user:", existingAdmin.id);
      
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingAdmin.id);
      
      if (deleteError) {
        console.error("Error deleting existing admin:", deleteError);
        throw deleteError;
      }
      
      console.log("Existing admin deleted successfully");
      
      // Small delay to ensure deletion is processed
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Re-check if user exists (another request may have created it)
    const { data: recheckBeforeCreate } = await supabaseAdmin.auth.admin.listUsers();
    const alreadyCreated = recheckBeforeCreate?.users?.find(u => u.email === email);
    
    if (alreadyCreated) {
      console.log("Admin user already exists (created by concurrent request):", alreadyCreated.id);
      return new Response(JSON.stringify({ 
        success: true,
        message: "Admin user already exists",
        user: { email, fullName }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Create new admin user
    console.log("Creating new admin user with email:", email);
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });
    
    if (error) {
      // Check if it's a duplicate error - user was created by concurrent request
      if (error.message?.includes('duplicate') || error.message?.includes('already') || error.status === 500) {
        console.log("Duplicate detected, checking for existing user...");
        
        const { data: finalCheck } = await supabaseAdmin.auth.admin.listUsers();
        const justCreated = finalCheck?.users?.find(u => u.email === email);
        
        if (justCreated) {
          console.log("Found user created by concurrent request:", justCreated.id);
          return new Response(JSON.stringify({ 
            success: true,
            message: "Admin user exists (created by concurrent request)",
            user: { email, fullName }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      
      console.error("Error creating admin user:", error);
      throw error;
    }
    
    console.log("Admin user created in auth, ID:", data.user?.id);
    
    // Update profiles table and user_roles table
    if (data.user) {
      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          role: 'admin',
          active: true,
          status: 'active'
        });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
      } else {
        console.log("Admin profile created successfully");
      }
      
      // Create user_roles entry
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: data.user.id,
          role: 'admin'
        }, {
          onConflict: 'user_id,role'
        });
      
      if (roleError) {
        console.error("Error creating user role:", roleError);
      } else {
        console.log("Admin role created successfully");
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: forceCreate ? "Admin user force created successfully" : "Default admin user created successfully",
      user: { email, fullName }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    console.error("Error creating default admin user:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
