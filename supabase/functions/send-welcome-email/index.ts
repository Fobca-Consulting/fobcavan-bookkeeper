import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Define environment variable types
interface DenoEnv {
  get(key: string): string | undefined;
}

interface EmailRequest {
  email: string;
  name: string;
  tempPassword?: string;
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
    const { email, name, tempPassword } = await req.json() as EmailRequest;
    
    console.log(`Sending welcome email to ${email}`);
    
    // In a real implementation, you would use SendGrid
    // Since we don't have the API key yet, we'll simulate success
    
    // For a real implementation with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(Deno.env.get("SENDGRID_API_KEY"));
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@fobcabookkeeper.com',
    //   subject: 'Welcome to FOBCA Bookkeeper',
    //   html: `<p>Hello ${name},</p>
    //          <p>You've been invited to join FOBCA Bookkeeper.</p>
    //          <p>Please use the following temporary password to login: 
    //             <strong>${tempPassword}</strong></p>
    //          <p>You will be prompted to change your password after first login.</p>`,
    // });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Welcome email sent to ${email}` 
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500,
      }
    );
  }
};

serve(handler);
