import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportData {
  exportDate: string;
  user: {
    id: string;
    email: string | null;
  };
  profile: unknown;
  transactions: unknown[];
  accounts: unknown[];
  documents: unknown[];
  budgets: unknown[];
  financialGoals: unknown[];
  taxSettings: unknown;
  deadlines: unknown[];
  voiceEntries: unknown[];
  chatHistory: unknown[];
  preferences: unknown;
  auditLogs: unknown[];
}

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

    console.log(`GDPR Data Export requested for user: ${user.id}`);

    // Create admin client for data access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all user data in parallel
    const [
      profileResult,
      transactionsResult,
      accountsResult,
      documentsResult,
      budgetsResult,
      goalsResult,
      taxSettingsResult,
      deadlinesResult,
      voiceEntriesResult,
      chatHistoryResult,
      preferencesResult,
      auditLogsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("user_id", user.id),
      supabase.from("accounts").select("*").eq("user_id", user.id),
      supabase.from("documents").select("id, file_name, file_type, file_size, category, tags, created_at").eq("user_id", user.id),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("financial_goals").select("*").eq("user_id", user.id),
      supabase.from("tax_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("deadlines").select("*").eq("user_id", user.id),
      supabase.from("voice_entries").select("*").eq("user_id", user.id),
      supabase.from("chat_history").select("*").eq("user_id", user.id),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
      supabase.from("security_audit_logs").select("action_type, action_description, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
    ]);

    // Compile export data
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile: profileResult.data || {},
      transactions: transactionsResult.data || [],
      accounts: accountsResult.data || [],
      documents: documentsResult.data || [],
      budgets: budgetsResult.data || [],
      financialGoals: goalsResult.data || [],
      taxSettings: taxSettingsResult.data || {},
      deadlines: deadlinesResult.data || [],
      voiceEntries: voiceEntriesResult.data || [],
      chatHistory: chatHistoryResult.data || [],
      preferences: preferencesResult.data || {},
      auditLogs: auditLogsResult.data || [],
    };

    // Log the export request for compliance
    await supabase.from("security_audit_logs").insert({
      user_id: user.id,
      action_type: "GDPR_DATA_EXPORT",
      action_description: "User requested full data export under GDPR",
      metadata: {
        export_timestamp: exportData.exportDate,
        tables_included: [
          "profiles", "transactions", "accounts", "documents", 
          "budgets", "financial_goals", "tax_settings", "deadlines",
          "voice_entries", "chat_history", "user_preferences", "security_audit_logs"
        ],
      },
    });

    console.log(`GDPR Data Export completed for user: ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: exportData,
        message: "Your data has been compiled successfully. This export includes all personal data we hold about you.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("GDPR Export Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to export data", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
