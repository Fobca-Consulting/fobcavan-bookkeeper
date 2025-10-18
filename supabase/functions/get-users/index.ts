
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify that the request is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT token to get user ID
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callingUser) {
      throw new Error("Unauthorized");
    }

    // Check if calling user is an admin
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id);

    if (roleError || !callerRoles.some(r => r.role === "admin")) {
      throw new Error("Only admins can access user list");
    }

    // Get all users with their profiles
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      throw authUsersError;
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*");

    if (profilesError) {
      throw profilesError;
    }

    // Get all user roles
    const { data: userRoles, error: userRolesError } = await supabaseAdmin
      .from("user_roles")
      .select("*");

    if (userRolesError) {
      throw userRolesError;
    }

    // Combine auth, profile, and role data
    const users = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || {};
      const roles = userRoles.filter(r => r.user_id === authUser.id).map(r => r.role);
      const primaryRole = roles[0] || profile.role || 'staff'; // Fallback to profile role for compatibility
      
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name || authUser.user_metadata?.full_name || 'Unnamed User',
        role: primaryRole,
        roles: roles,
        active: profile.active !== undefined ? profile.active : true,
        status: profile.status || 'active',
        last_active: profile.last_active || null,
        created_at: authUser.created_at,
      };
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        users 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: error.message === "Unauthorized" || error.message === "Only admins can access user list" ? 403 : 500,
      }
    );
  }
};

serve(handler);
