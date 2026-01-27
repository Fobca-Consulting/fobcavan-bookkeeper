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

    const email = "bilesanmioluwafayokunmi@gmail.com";
    const password = "23456789";
    const contactName = "Oluwafayokunmi Bilesanmi";
    const businessName = "Bilesanmi Enterprise";

    // Check if user already exists
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
      console.log("Updated existing user:", userId);
    } else {
      // Create new user
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: contactName, role: 'client', business_name: businessName }
      });
      if (createError) throw createError;
      userId = authData.user.id;
      console.log("Created new user:", userId);
    }

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: contactName,
      role: 'client',
      active: true,
      status: 'active'
    });

    // Add client role
    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: 'client' },
      { onConflict: 'user_id,role' }
    );

    // Check/create client record
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select()
      .eq("email", email)
      .maybeSingle();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
      await supabaseAdmin.from("clients").update({
        user_id: userId,
        portal_access: true,
        contact_name: contactName
      }).eq("id", clientId);
    } else {
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          business_name: businessName,
          client_type: "individual",
          contact_name: contactName,
          email: email,
          portal_access: true,
          user_id: userId
        })
        .select()
        .single();
      if (clientError) throw clientError;
      clientId = newClient.id;
    }

    // Create client_access
    await supabaseAdmin.from("client_access").upsert(
      { user_id: userId, client_id: clientId },
      { onConflict: 'user_id,client_id' }
    );

    return new Response(
      JSON.stringify({ success: true, message: "Test client created successfully", userId, clientId }),
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
