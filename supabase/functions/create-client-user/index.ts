import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

interface CreateClientRequest {
  email: string;
  businessName: string;
  contactName: string;
  clientType: string;
  phone?: string;
  address?: string;
  tempPassword: string;
  message?: string;
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
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callingUser.id)
      .single();

    if (profileError || callerProfile.role !== "admin") {
      throw new Error("Only admins can create client users");
    }

    // Get client data from request
    const { 
      email, 
      businessName, 
      contactName, 
      clientType, 
      phone, 
      address, 
      tempPassword, 
      message 
    }: CreateClientRequest = await req.json();

    console.log(`Creating client user for ${email} - ${businessName}`);

    // Create the user in Supabase Auth
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: contactName, 
        role: 'client',
        business_name: businessName 
      },
    });

    if (createUserError) {
      throw createUserError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create client record in the clients table
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        business_name: businessName,
        client_type: clientType,
        contact_name: contactName,
        email: email,
        phone: phone,
        address: address,
        portal_access: true,
        user_id: authData.user.id
      })
      .select()
      .single();

    if (clientError) {
      console.error("Error creating client record:", clientError);
      // Clean up the auth user if client creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw clientError;
    }

    // Send welcome email
    const emailResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          name: contactName,
          tempPassword,
          clientType,
          businessName,
          message
        }),
      }
    );

    if (!emailResponse.ok) {
      console.warn("Failed to send welcome email, but user was created successfully");
    }

    console.log("Client user created successfully:", clientData);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Client user created successfully",
        client: clientData,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
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
    console.error("Error creating client user:", error);
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
        status: error.message === "Unauthorized" || error.message === "Only admins can create client users" ? 403 : 500,
      }
    );
  }
};

serve(handler);