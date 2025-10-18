import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

interface UpdateUserRequest {
  userId: string;
  full_name?: string;
  role?: string;
  active?: boolean;
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
      throw new Error("Only admins can update users");
    }

    // Get user data from request
    const { userId, full_name, role, active }: UpdateUserRequest = await req.json();

    // Update profile
    const profileUpdates: any = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (active !== undefined) profileUpdates.active = active;
    
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }
    }

    // Update role if changed
    if (role !== undefined) {
      // Delete existing roles
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Insert new role
      const { error: roleInsertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleInsertError) {
        throw roleInsertError;
      }

      // Also update profile for backward compatibility
      await supabaseAdmin
        .from("profiles")
        .update({ role })
        .eq("id", userId);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User updated successfully"
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
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: error.message === "Unauthorized" || error.message === "Only admins can update users" ? 403 : 500,
      }
    );
  }
};

serve(handler);
