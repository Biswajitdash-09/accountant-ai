import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Create client with user's token for auth
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { confirm_deletion } = await req.json();
    
    if (!confirm_deletion) {
      return new Response(
        JSON.stringify({ 
          error: "Deletion not confirmed",
          message: "Please confirm you want to delete all your data by setting confirm_deletion to true"
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`GDPR Data Deletion requested for user: ${user.id}`);

    // Create admin client for data deletion
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email before deletion for notification
    const userEmail = user.email;

    // Define deletion order (respecting foreign key constraints)
    const tablesToDelete = [
      // Child tables first
      "crypto_transactions",
      "crypto_holdings",
      "crypto_nfts",
      "crypto_wallets",
      "document_ai_analysis",
      "api_usage_logs",
      "webhook_deliveries",
      "webhooks",
      "hmrc_tax_data",
      "hmrc_data_sync",
      "hmrc_tokens",
      "hmrc_connections",
      "investment_alerts",
      "inter_entity_transactions",
      "entity_relationships",
      "activity_feeds",
      "collaboration_invites",
      "budget_templates",
      "custom_reports",
      "balance_sheet_items",
      // Parent tables
      "voice_entries",
      "chat_history",
      "barcode_spreadsheets",
      "barcode_scans",
      "deadlines",
      "financial_goals",
      "budgets",
      "tax_settings",
      "tax_deductions",
      "documents",
      "transactions",
      "accounts",
      "investment_portfolio",
      "user_investments",
      "api_keys",
      "user_credits",
      "user_security_settings",
      "user_preferences",
      "arnold_notifications",
      "analytics_cache",
      "security_audit_logs",
      "business_entities",
      "audit_logs",
    ];

    const deletionResults: Record<string, { deleted: boolean; error?: string }> = {};

    // Delete data from each table
    for (const table of tablesToDelete) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", user.id);
        
        if (error) {
          console.warn(`Failed to delete from ${table}:`, error.message);
          deletionResults[table] = { deleted: false, error: error.message };
        } else {
          deletionResults[table] = { deleted: true };
        }
      } catch (e) {
        console.warn(`Error deleting from ${table}:`, e.message);
        deletionResults[table] = { deleted: false, error: e.message };
      }
    }

    // Delete profile last
    try {
      await supabase.from("profiles").delete().eq("id", user.id);
      deletionResults["profiles"] = { deleted: true };
    } catch (e) {
      deletionResults["profiles"] = { deleted: false, error: e.message };
    }

    // Delete storage objects
    try {
      // List and delete user's documents
      const { data: files } = await supabase.storage.from("documents").list(user.id);
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from("documents").remove(filePaths);
      }

      // Delete avatar
      await supabase.storage.from("avatars").remove([`${user.id}`]);
      
      // Delete voice recordings
      const { data: voiceFiles } = await supabase.storage.from("voice").list(user.id);
      if (voiceFiles && voiceFiles.length > 0) {
        const voicePaths = voiceFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from("voice").remove(voicePaths);
      }

      deletionResults["storage"] = { deleted: true };
    } catch (e) {
      deletionResults["storage"] = { deleted: false, error: e.message };
    }

    // Send confirmation email
    if (resendApiKey && userEmail) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Accountant AI <noreply@resend.dev>",
          to: [userEmail],
          subject: "Your data has been deleted - Accountant AI",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">Data Deletion Complete</h1>
              <p>As per your request under GDPR, all your personal data has been permanently deleted from Accountant AI.</p>
              <p>This includes:</p>
              <ul>
                <li>Your profile information</li>
                <li>All transactions and financial records</li>
                <li>Documents and receipts</li>
                <li>Budgets and financial goals</li>
                <li>Chat history and AI interactions</li>
                <li>All other personal data</li>
              </ul>
              <p>Your account has been closed. If you wish to use Accountant AI again in the future, you'll need to create a new account.</p>
              <p style="color: #666; margin-top: 30px;">Thank you for using Accountant AI. We're sorry to see you go.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send deletion confirmation email:", emailError);
      }
    }

    // Delete the auth user last (this effectively logs them out)
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteAuthError) {
        console.error("Failed to delete auth user:", deleteAuthError);
        deletionResults["auth_user"] = { deleted: false, error: deleteAuthError.message };
      } else {
        deletionResults["auth_user"] = { deleted: true };
      }
    } catch (e) {
      console.error("Failed to delete auth user:", e);
      deletionResults["auth_user"] = { deleted: false, error: e.message };
    }

    console.log(`GDPR Data Deletion completed for user: ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your data has been permanently deleted. Your account has been closed.",
        deletion_timestamp: new Date().toISOString(),
        details: deletionResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("GDPR Deletion Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete data", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
