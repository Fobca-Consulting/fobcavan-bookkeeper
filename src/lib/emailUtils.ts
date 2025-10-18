import { supabase } from "@/integrations/supabase/client";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Reusable utility to send emails via the send-email edge function
 * @param params Email parameters including to, subject, html, and optional from
 * @returns Promise with success status and any errors
 */
export const sendEmail = async (params: SendEmailParams) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      throw new Error('No authenticated session found');
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        subject: params.subject,
        html: params.html,
        from: params.from || 'FOBCA Bookkeeper <noreply@resend.dev>',
      },
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email utility error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a welcome email with password setup link to a new user
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  setupLink: string
) => {
  const html = `
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

  return sendEmail({
    to: email,
    subject: 'Welcome to FOBCA Bookkeeper - Set Up Your Account',
    html,
  });
};
