import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatExportRequest {
  email: string;
  htmlContent: string;
  jsonData: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client to verify auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body with size limits
    const contentLength = req.headers.get('content-length');
    const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB limit
    
    if (contentLength && parseInt(contentLength) > MAX_CONTENT_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request payload too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, htmlContent, jsonData }: ChatExportRequest = await req.json();

    // Additional size validation for content
    if (htmlContent.length > 5 * 1024 * 1024 || jsonData.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Content size exceeds limits' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll return a success response with escaped HTML
    // In production, you would integrate with Resend or another email service
    console.log("Chat export request received for:", email);
    console.log("HTML content length:", htmlContent.length);
    console.log("JSON data length:", jsonData.length);
    console.log("User ID:", user.id);

    // Escape HTML content for security
    const escapedHtml = escapeHtml(htmlContent);
    const escapedJson = escapeHtml(jsonData);

    // TODO: Implement actual email sending with Resend
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // const emailResponse = await resend.emails.send({
    //   from: "Accountant AI <noreply@accountantai.com>",
    //   to: [email],
    //   subject: "Your Chat History Export - Accountant AI",
    //   html: `
    //     <h1>Chat Export</h1>
    //     <p>Hello,</p>
    //     <p>Here's your exported chat history:</p>
    //     <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
    //       <pre>${escapedHtml}</pre>
    //     </div>
    //     <p>Best regards,<br>The Lovable Team</p>
    //   `,
    //   attachments: [
    //     {
    //       filename: `chat-history-${new Date().toISOString().split('T')[0]}.json`,
    //       content: Buffer.from(escapedJson).toString('base64'),
    //     },
    //   ],
    // });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Chat history export prepared successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-chat-export function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// HTML escape function for security
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(handler);