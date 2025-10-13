import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resend = {
  emails: {
    send: async (options: any) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }
      
      return response.json();
    }
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  name: string;
  type: 'registration' | 'login';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, type }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    const subject = type === 'registration' 
      ? 'Welcome to ShareSpace - Registration Successful!' 
      : 'Login Successful - ShareSpace';

    const html = type === 'registration'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome to ShareSpace, ${name}!</h1>
          <p style="color: #4a4a4a; font-size: 16px;">
            Your registration was successful! We're excited to have you join our campus marketplace community.
          </p>
          <p style="color: #4a4a4a; font-size: 16px;">
            You can now:
          </p>
          <ul style="color: #4a4a4a; font-size: 16px;">
            <li>Browse products from fellow students</li>
            <li>List your own items for sale</li>
            <li>Connect with buyers and sellers through our chat system</li>
            <li>Leave feedback and reviews</li>
          </ul>
          <p style="color: #4a4a4a; font-size: 16px;">
            Best regards,<br>
            The ShareSpace Team
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome back, ${name}!</h1>
          <p style="color: #4a4a4a; font-size: 16px;">
            You have successfully logged into your ShareSpace account.
          </p>
          <p style="color: #4a4a4a; font-size: 16px;">
            If you didn't attempt to log in, please secure your account immediately.
          </p>
          <p style="color: #4a4a4a; font-size: 16px;">
            Best regards,<br>
            The ShareSpace Team
          </p>
        </div>
      `;

     const emailResponse = await resend.emails.send({
       from: "ShareSpace <onboarding@resend.dev>",
       to: [Deno.env.get("TEST_EMAIL_OVERRIDE")?.trim() || email],
       subject: Deno.env.get("TEST_EMAIL_OVERRIDE") ? ('[TEST] ' + subject + ' (intended: ' + email + ')') : subject,
       html: Deno.env.get("TEST_EMAIL_OVERRIDE")
         ? '<p style="font-size:12px;color:#666;margin:0 0 8px 0;">TEST MODE: Intended recipient: ' + email + '</p>' + html
         : html,
     });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
