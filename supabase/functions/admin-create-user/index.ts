
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

interface CreateUserRequest {
  email: string;
  full_name: string;
  role: string;
  active: boolean;
}

const generateWelcomeEmailHtml = (name: string, setupLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to FOBCA Bookkeeper</h1>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${name},</h2>
        <p style="color: #475569; line-height: 1.6;">
          You have been invited to join FOBCA Bookkeeper. Please set up your account to get started.
        </p>
        
        <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Set Up Your Account</h3>
          <p style="color: #166534; margin-bottom: 15px;">
            Click the button below to set up your password and access your account:
          </p>
          <div style="text-align: center;">
            <a href="${setupLink}" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Set Up Your Password
            </a>
          </div>
          <p style="color: #15803d; font-size: 14px; margin-top: 15px;">
            ⏰ This link will expire in 24 hours.
          </p>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          If you have any questions, please contact your FOBCA administrator.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">
          © 2024 FOBCA Bookkeeper. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

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
      throw new Error("Only admins can create users");
    }

    // Get user data from request
    const { email, full_name, role, active }: CreateUserRequest = await req.json();

    // Create the user in Supabase Auth without password
    // User status will be pending until they set their password
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false, // User needs to confirm via recovery link
      user_metadata: { full_name, role },
    });

    if (createUserError) {
      throw createUserError;
    }

    // Update the profile to set status to pending and active to false
    if (authData.user) {
      await supabaseAdmin
        .from("profiles")
        .update({ active: false, status: 'pending' })
        .eq("id", authData.user.id);

      // Add role to user_roles table
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: authData.user.id, role });

      // Generate password recovery link for user to set their password
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

      if (resetError) {
        console.error("Error generating recovery link:", resetError);
        throw resetError;
      }

      // Send welcome email with password setup link using the new send-email function
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: email,
            subject: 'Welcome to FOBCA Bookkeeper - Set Up Your Account',
            html: generateWelcomeEmailHtml(full_name, resetData.properties.action_link),
          }),
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User created successfully",
        user: {
          id: authData.user.id,
          email,
          full_name,
          role,
          active: false,
          status: 'pending',
          created_at: authData.user.created_at,
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
    console.error("Error creating user:", error);
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
        status: error.message === "Unauthorized" || error.message === "Only admins can create users" ? 403 : 500,
      }
    );
  }
};

serve(handler);
