import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, subscription_id, plan_id, billing_cycle } = await req.json();

    let result;
    switch (action) {
      case 'create':
        result = await createSubscription(supabaseClient, user, plan_id, billing_cycle);
        break;
      case 'cancel':
        result = await cancelSubscription(supabaseClient, user, subscription_id);
        break;
      case 'update':
        result = await updateSubscription(supabaseClient, user, subscription_id, plan_id);
        break;
      case 'pause':
        result = await pauseSubscription(supabaseClient, user, subscription_id);
        break;
      case 'resume':
        result = await resumeSubscription(supabaseClient, user, subscription_id);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createSubscription(supabase: any, user: any, planId: string, billingCycle: string) {
  const plans: Record<string, any> = {
    starter: { name: 'Starter', amount: 9.99, credits: 100 },
    pro: { name: 'Pro', amount: 29.99, credits: 500 },
    business: { name: 'Business', amount: 99.99, credits: 2000 },
  };

  const plan = plans[planId];
  if (!plan) throw new Error('Invalid plan');

  const amount = billingCycle === 'yearly' ? plan.amount * 10 : plan.amount;

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_id: planId,
      plan_name: plan.name,
      billing_cycle: billingCycle,
      amount,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Add credits
  await supabase.rpc('add_user_credits', {
    p_user_id: user.id,
    p_amount: plan.credits,
    p_description: `${plan.name} subscription credits`,
  });

  return data;
}

async function cancelSubscription(supabase: any, user: any, subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSubscription(supabase: any, user: any, subscriptionId: string, newPlanId: string) {
  const plans: Record<string, any> = {
    starter: { name: 'Starter', amount: 9.99, credits: 100 },
    pro: { name: 'Pro', amount: 29.99, credits: 500 },
    business: { name: 'Business', amount: 99.99, credits: 2000 },
  };

  const plan = plans[newPlanId];
  if (!plan) throw new Error('Invalid plan');

  const { data: currentSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .single();

  if (!currentSub) throw new Error('Subscription not found');

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan_id: newPlanId,
      plan_name: plan.name,
      amount: currentSub.billing_cycle === 'yearly' ? plan.amount * 10 : plan.amount,
    })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function pauseSubscription(supabase: any, user: any, subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'paused' })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function resumeSubscription(supabase: any, user: any, subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
