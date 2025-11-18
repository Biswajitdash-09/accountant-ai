-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  stripe_subscription_id text,
  cashfree_subscription_id text,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  trial_end timestamptz,
  billing_cycle text DEFAULT 'monthly',
  amount numeric NOT NULL,
  currency text DEFAULT 'usd',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  provider_refund_id text,
  processed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  payment_id uuid REFERENCES payments,
  subscription_id uuid REFERENCES subscriptions,
  invoice_number text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'pending',
  due_date timestamptz,
  paid_at timestamptz,
  pdf_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create payment_attempts table for fraud detection
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  ip_address inet,
  user_agent text,
  payment_method text,
  amount numeric,
  currency text,
  status text,
  failure_reason text,
  risk_score integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enhance payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES invoices;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded boolean DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS risk_assessment jsonb;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds" ON public.refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create refund requests" ON public.refunds FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_attempts
CREATE POLICY "Users can view their own payment attempts" ON public.payment_attempts FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_user_id ON public.payment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created_at ON public.payment_attempts(created_at);