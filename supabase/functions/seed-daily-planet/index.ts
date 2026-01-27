import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const businessName = "Daily Planet";
    
    // User 1: Lois Lane (Primary Contact)
    const loisEmail = "lois.lane@dailyplanet.com";
    const loisPassword = "Lois@Planet123";
    const loisName = "Lois Lane";
    
    // User 2: James Olsen (Staff)
    const jamesEmail = "james.olsen@dailyplanet.com";
    const jamesPassword = "James@Planet123";
    const jamesName = "James Olsen";

    // Helper function to create or update a user
    async function createOrUpdateUser(email: string, password: string, fullName: string, isPrimaryContact: boolean) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === email);

      let userId: string;

      if (existingUser) {
        // Update existing user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password, email_confirm: true }
        );
        if (updateError) throw updateError;
        userId = existingUser.id;
        console.log(`Updated existing user: ${email} -> ${userId}`);
      } else {
        // Create new user
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { 
            full_name: fullName, 
            role: 'client', 
            business_name: businessName,
            is_primary_contact: isPrimaryContact
          }
        });
        if (createError) throw createError;
        userId = authData.user.id;
        console.log(`Created new user: ${email} -> ${userId}`);
      }

      // Upsert profile
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        role: 'client',
        active: true,
        status: 'active'
      });

      // Add client role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: 'client' },
        { onConflict: 'user_id,role' }
      );

      return userId;
    }

    // Create both users
    const loisUserId = await createOrUpdateUser(loisEmail, loisPassword, loisName, true);
    const jamesUserId = await createOrUpdateUser(jamesEmail, jamesPassword, jamesName, false);

    // Check if client already exists
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select()
      .eq("business_name", businessName)
      .maybeSingle();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
      // Update client with primary contact (Lois Lane)
      await supabaseAdmin.from("clients").update({
        user_id: loisUserId,
        portal_access: true,
        contact_name: loisName,
        email: loisEmail
      }).eq("id", clientId);
      console.log(`Updated existing client: ${businessName} -> ${clientId}`);
    } else {
      // Create new client with Lois Lane as primary contact
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          business_name: businessName,
          client_type: "direct",
          contact_name: loisName,
          email: loisEmail,
          portal_access: true,
          user_id: loisUserId
        })
        .select()
        .single();
      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log(`Created new client: ${businessName} -> ${clientId}`);
    }

    // Create client_access for both users
    await supabaseAdmin.from("client_access").upsert(
      { user_id: loisUserId, client_id: clientId },
      { onConflict: 'user_id,client_id' }
    );
    console.log(`Client access created for Lois Lane -> ${clientId}`);

    await supabaseAdmin.from("client_access").upsert(
      { user_id: jamesUserId, client_id: clientId },
      { onConflict: 'user_id,client_id' }
    );
    console.log(`Client access created for James Olsen -> ${clientId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily Planet client created with two users", 
        clientId,
        users: [
          { name: loisName, email: loisEmail, userId: loisUserId, role: "Primary Contact" },
          { name: jamesName, email: jamesEmail, userId: jamesUserId, role: "Staff" }
        ]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
