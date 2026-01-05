
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
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('Missing Authorization header');
      throw new Error('Missing Authorization header');
    }

    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT token to get user ID
    const token = authHeader.replace("Bearer ", "");
    console.log('Token length:', token.length);
    
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError) {
      console.error('Auth error:', authError.message);
      throw new Error("Unauthorized: " + authError.message);
    }
    
    if (!callingUser) {
      console.error('No user found for token');
      throw new Error("Unauthorized: No user found");
    }
    
    console.log('Authenticated user:', callingUser.id);

    // Check if calling user is an admin - check user_roles first, then profile as fallback
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id);

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
    }
    
    let isAdmin = callerRoles?.some(r => r.role === "admin");
    
    // Fallback: check profile role or user metadata
    if (!isAdmin) {
      console.log('No admin role in user_roles, checking profile and metadata...');
      
      // Check profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", callingUser.id)
        .single();
      
      if (profile?.role === 'admin') {
        isAdmin = true;
        console.log('Admin found in profile');
        
        // Also add to user_roles for future consistency
        await supabaseAdmin.from("user_roles").upsert({
          user_id: callingUser.id,
          role: 'admin'
        }, { onConflict: 'user_id,role' }).then(({ error }) => {
          if (error) console.error('Error syncing user_roles:', error);
          else console.log('Synced admin role to user_roles table');
        });
      }
      
      // Check user metadata as last resort
      if (!isAdmin && callingUser.user_metadata?.role === 'admin') {
        isAdmin = true;
        console.log('Admin found in user metadata');
        
        // Sync to both tables
        await Promise.all([
          supabaseAdmin.from("profiles").upsert({
            id: callingUser.id,
            full_name: callingUser.user_metadata?.full_name || 'Admin User',
            role: 'admin',
            active: true,
            status: 'active'
          }),
          supabaseAdmin.from("user_roles").upsert({
            user_id: callingUser.id,
            role: 'admin'
          }, { onConflict: 'user_id,role' })
        ]).then(() => console.log('Synced admin data to profile and user_roles'));
      }
    }

    if (!isAdmin) {
      throw new Error("Only admins can access user list");
    }
    
    console.log('User verified as admin, proceeding...');

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
