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

    // For now, we'll return a success response
    // In production, you would integrate with Resend or another email service
    console.log("Chat export request received for:", email);
    console.log("HTML content length:", htmlContent.length);
    console.log("JSON data length:", jsonData.length);

    // TODO: Implement actual email sending with Resend
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // const emailResponse = await resend.emails.send({
    //   from: "Accountant AI <noreply@accountantai.com>",
    //   to: [email],
    //   subject: "Your Chat History Export - Accountant AI",
    //   html: htmlContent,
    //   attachments: [
    //     {
    //       filename: `chat-history-${new Date().toISOString().split('T')[0]}.json`,
    //       content: Buffer.from(jsonData).toString('base64'),
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

serve(handler);