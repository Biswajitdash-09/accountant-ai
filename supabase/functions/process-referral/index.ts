import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REFERRAL_BONUS_CREDITS = 50; // Credits for referrer
const REFERRED_BONUS_CREDITS = 25; // Credits for referred user

interface ReferralRequest {
  referralCode: string;
  referredUserId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { referralCode, referredUserId }: ReferralRequest = await req.json();

    if (!referralCode || !referredUserId) {
      return new Response(
        JSON.stringify({ error: "Missing referral code or user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing referral: code=${referralCode}, referredUserId=${referredUserId}`);

    // Find the referrer by their referral code (stored in profiles)
    const { data: referrerProfile, error: referrerError } = await supabaseClient
      .from("profiles")
      .select("id, full_name, email, referral_code")
      .eq("referral_code", referralCode)
      .single();

    if (referrerError || !referrerProfile) {
      console.error("Referrer not found:", referrerError);
      return new Response(
        JSON.stringify({ error: "Invalid referral code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-referral
    if (referrerProfile.id === referredUserId) {
      return new Response(
        JSON.stringify({ error: "Cannot refer yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this user was already referred
    const { data: existingReferral } = await supabaseClient
      .from("profiles")
      .select("referred_by")
      .eq("id", referredUserId)
      .single();

    if (existingReferral?.referred_by) {
      return new Response(
        JSON.stringify({ error: "User already has a referrer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update referred user's profile with referrer info
    const { error: updateReferredError } = await supabaseClient
      .from("profiles")
      .update({
        referred_by: referrerProfile.id,
        referred_at: new Date().toISOString(),
      })
      .eq("id", referredUserId);

    if (updateReferredError) {
      console.error("Error updating referred user:", updateReferredError);
      // Continue anyway - we'll still award credits
    }

    // Award credits to referrer
    const { error: referrerCreditsError } = await supabaseClient.rpc(
      "add_credits",
      {
        p_user_id: referrerProfile.id,
        p_amount: REFERRAL_BONUS_CREDITS,
        p_reason: `Referral bonus - invited a friend`,
      }
    );

    if (referrerCreditsError) {
      console.error("Error awarding referrer credits:", referrerCreditsError);
      // Fallback: try direct insert
      await supabaseClient.from("credit_transactions").insert({
        user_id: referrerProfile.id,
        amount: REFERRAL_BONUS_CREDITS,
        transaction_type: "referral_bonus",
        description: "Referral bonus - invited a friend",
      });
    }

    // Award credits to referred user
    const { error: referredCreditsError } = await supabaseClient.rpc(
      "add_credits",
      {
        p_user_id: referredUserId,
        p_amount: REFERRED_BONUS_CREDITS,
        p_reason: `Welcome bonus - referred by a friend`,
      }
    );

    if (referredCreditsError) {
      console.error("Error awarding referred credits:", referredCreditsError);
      // Fallback: try direct insert
      await supabaseClient.from("credit_transactions").insert({
        user_id: referredUserId,
        amount: REFERRED_BONUS_CREDITS,
        transaction_type: "referral_welcome",
        description: "Welcome bonus - referred by a friend",
      });
    }

    // Create notifications for both users
    const notifications = [
      {
        user_id: referrerProfile.id,
        title: "🎉 Referral Successful!",
        message: `Your friend joined Accountant AI! You earned ${REFERRAL_BONUS_CREDITS} bonus credits.`,
        type: "system",
        priority: "medium",
      },
      {
        user_id: referredUserId,
        title: "🎁 Welcome Bonus!",
        message: `You've received ${REFERRED_BONUS_CREDITS} bonus credits for joining via referral!`,
        type: "system",
        priority: "medium",
      },
    ];

    await supabaseClient.from("notifications").insert(notifications);

    // Update referrer's referral stats
    await supabaseClient.rpc("increment_referral_count", {
      p_user_id: referrerProfile.id,
    }).catch(() => {
      // Ignore if RPC doesn't exist
      console.log("increment_referral_count RPC not available");
    });

    console.log(`Referral processed successfully: referrer=${referrerProfile.id}, referred=${referredUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Referral processed successfully",
        referrerCredits: REFERRAL_BONUS_CREDITS,
        referredCredits: REFERRED_BONUS_CREDITS,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing referral:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
