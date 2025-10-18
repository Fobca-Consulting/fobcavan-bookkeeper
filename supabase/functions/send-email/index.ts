import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
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
    const { to, subject, html, from } = await req.json() as EmailRequest;
    
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters: to, subject, or html');
    }
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from || "FOBCA Bookkeeper <noreply@resend.dev>",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${errorData.message}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Email sent to ${to}`,
        emailId: emailData?.id
      }),
      {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred"
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
