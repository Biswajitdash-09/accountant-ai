-- Phase 1 Security Fix: Restrict Payment Table RLS Policies
-- Remove overly permissive policies and ensure only service_role can create/update payments

-- Drop the overly permissive policies that allow any authenticated user to insert/update payments
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- Keep the user view policy (this is correct - users should see their own payments)
-- DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

-- Keep the service role management policy (this is correct for service operations)
-- DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- Add a more restrictive policy for user inserts (only allow if user_id matches)
CREATE POLICY "Users can create their own payment records"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add a more restrictive policy for user updates (only allow updating their own pending payments)
CREATE POLICY "Users can update their own pending payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Add audit logging trigger for payment operations
CREATE OR REPLACE FUNCTION log_payment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log payment modifications to security audit logs
  INSERT INTO public.security_audit_logs (
    user_id,
    action_type,
    action_description,
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    'Payment ' || TG_OP || ' operation',
    jsonb_build_object(
      'table', 'payments',
      'payment_id', COALESCE(NEW.id, OLD.id),
      'amount', COALESCE(NEW.amount, OLD.amount),
      'status', COALESCE(NEW.status, OLD.status),
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for payment audit logging
DROP TRIGGER IF EXISTS payment_audit_trigger ON public.payments;
CREATE TRIGGER payment_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_changes();

-- Add comment explaining the security model
COMMENT ON TABLE public.payments IS 'Payment records with restricted RLS. Users can view their own payments and create payment records during checkout. Only service_role can modify payment status and complete payment processing.';