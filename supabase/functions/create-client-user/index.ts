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
      .select("role, full_name")
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

    // Check if email already exists in clients table first (email uniqueness check)
    const { data: existingClientByEmail } = await supabaseAdmin
      .from("clients")
      .select("id, email, business_name")
      .eq("email", email)
      .maybeSingle();

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users.find(u => u.email === email);

    // If email exists in clients table and we're not explicitly updating, throw error
    if (existingClientByEmail && !existingAuthUser) {
      throw new Error(`Email ${email} is already registered to another client: ${existingClientByEmail.business_name}`);
    }

    let userId: string;
    let isExistingUser = false;

    if (existingAuthUser) {
      console.log(`User ${email} already exists, updating password and metadata`);
      isExistingUser = true;
      userId = existingAuthUser.id;

      // Update the existing user's password and metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password: tempPassword,
          user_metadata: { 
            full_name: contactName, 
            role: 'client',
            business_name: businessName 
          },
        }
      );

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new user in Supabase Auth
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

      userId = authData.user.id;
      
      // Create profile for the new user
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: contactName,
        role: 'client',
        active: true,
        status: 'pending'
      });
      
      // Add client role to user_roles
      await supabaseAdmin.from("user_roles").upsert({
        user_id: userId,
        role: 'client'
      }, { onConflict: 'user_id,role' });
    }

    // Check if client record exists
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select()
      .eq("email", email)
      .maybeSingle();

    let clientData;

    if (existingClient) {
      // Update existing client record
      const { data: updatedClient, error: updateError } = await supabaseAdmin
        .from("clients")
        .update({
          business_name: businessName,
          client_type: clientType,
          contact_name: contactName,
          phone: phone,
          address: address,
          portal_access: true,
          user_id: userId
        })
        .eq("email", email)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating client record:", updateError);
        if (!isExistingUser) {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
        throw updateError;
      }

      clientData = updatedClient;

      // Log activity for update
      await supabaseAdmin.from("client_activities").insert({
        client_id: updatedClient.id,
        user_id: callingUser.id,
        action_type: "updated",
        description: `${callerProfile.full_name || 'Admin'} updated client ${businessName}`
      });
      
      // Ensure client_access entry exists for updated client
      await supabaseAdmin.from("client_access").upsert({
        user_id: userId,
        client_id: updatedClient.id
      }, { onConflict: 'user_id,client_id' }).then(({ error }) => {
        if (error) {
          console.error("Error creating/updating client_access:", error);
        } else {
          console.log("Client access ensured for user", userId, "to client", updatedClient.id);
        }
      });
    } else {
      // Create new client record
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          business_name: businessName,
          client_type: clientType,
          contact_name: contactName,
          email: email,
          phone: phone,
          address: address,
          portal_access: true,
          user_id: userId
        })
        .select()
        .single();

      if (clientError) {
        console.error("Error creating client record:", clientError);
        if (!isExistingUser) {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
        throw clientError;
      }

      clientData = newClient;

      // Log activity for creation
      await supabaseAdmin.from("client_activities").insert({
        client_id: newClient.id,
        user_id: callingUser.id,
        action_type: "created",
        description: `${callerProfile.full_name || 'Admin'} created client ${businessName}`
      });
      
      // Create client_access entry to link the user to their client
      await supabaseAdmin.from("client_access").upsert({
        user_id: userId,
        client_id: newClient.id
      }, { onConflict: 'user_id,client_id' }).then(({ error }) => {
        if (error) {
          console.error("Error creating client_access:", error);
        } else {
          console.log("Client access created for user", userId, "to client", newClient.id);
        }
      });
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
        message: isExistingUser ? "Client user updated and invite resent successfully" : "Client user created successfully",
        client: clientData,
        user: {
          id: userId,
          email: email,
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