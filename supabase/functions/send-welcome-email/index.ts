import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// For now, we'll implement email sending using a simple fetch to simulate Resend
// In production, you would use the actual Resend SDK

interface EmailRequest {
  email: string;
  name: string;
  tempPassword?: string;
  clientType?: string;
  businessName?: string;
  message?: string;
  setupLink?: string;
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
    const { email, name, tempPassword, clientType, businessName, message, setupLink } = await req.json() as EmailRequest;
    
    console.log(`Sending welcome email to ${email} for ${businessName || name}`);
    
    const emailSubject = businessName 
      ? `Welcome to FOBCA Bookkeeper - ${businessName}` 
      : `Welcome to FOBCA Bookkeeper`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to FOBCA Bookkeeper</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #475569; line-height: 1.6;">
            ${clientType ? `You have been invited to join FOBCA Bookkeeper as a ${clientType === 'direct' ? 'Direct Client' : 'Indirect Client'}.` : 'You have been added as a user to FOBCA Bookkeeper.'}
            ${businessName ? `Your business "${businessName}" has been set up in our system.` : ''}
          </p>
          
          ${message ? `
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="color: #0f172a; margin: 0; font-style: italic;">"${message}"</p>
            </div>
          ` : ''}
          
          ${setupLink ? `
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
          ` : tempPassword ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">Your Login Credentials</h3>
              <p style="color: #92400e; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fffbeb; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code></p>
              <p style="color: #b45309; font-size: 14px; margin-top: 10px;">
                ⚠️ Please change your password after your first login for security.
              </p>
            </div>
          ` : ''}
          
          ${!setupLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://fobcabookkeeper.com/signin" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Access Your Portal
              </a>
            </div>
          ` : ''}
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FOBCA Bookkeeper <noreply@resend.dev>", // You can customize this domain in Resend
        to: [email],
        subject: emailSubject,
        html: emailHtml,
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
        message: `Welcome email sent to ${email}`,
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
    console.error("Error sending welcome email:", error);
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
