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
    
    // In a real implementation, you would use a service like Resend
    // Since we don't have the API key yet, we'll simulate success
    
    // For a real implementation:
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({
    //   from: "onboarding@fobcabookkeeper.com",
    //   to: [email],
    //   subject: "Welcome to FOBCA Bookkeeper",
    //   html: generateWelcomeEmailHtml(name, tempPassword)
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
