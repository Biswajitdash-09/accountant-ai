import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { email, htmlContent, jsonData }: ChatExportRequest = await req.json();

    // For now, we'll return a success response with escaped HTML
    // In production, you would integrate with Resend or another email service
    console.log("Chat export request received for:", email);
    console.log("HTML content length:", htmlContent.length);
    console.log("JSON data length:", jsonData.length);

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