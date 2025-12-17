-- Fix waitlist table security - restrict public access to only checking own position by email
DROP POLICY IF EXISTS "Anyone can check their waitlist position" ON public.waitlist;

-- Create a more restrictive policy - admins can view all entries
CREATE POLICY "Admins can view all waitlist entries" 
ON public.waitlist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role_type = 'admin'
    AND user_roles.is_active = true
  )
);

-- Create a secure function for checking waitlist position
CREATE OR REPLACE FUNCTION public.get_waitlist_position(check_email TEXT)
RETURNS TABLE (queue_position BIGINT, total_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_pos BIGINT;
  total_cnt BIGINT;
BEGIN
  -- Get the position of the user
  SELECT COUNT(*) + 1 INTO user_pos
  FROM waitlist w
  WHERE w.created_at < (SELECT created_at FROM waitlist WHERE email = check_email LIMIT 1);
  
  -- Get total count
  SELECT COUNT(*) INTO total_cnt FROM waitlist;
  
  -- Return results
  RETURN QUERY SELECT user_pos, total_cnt;
END;
$$;

-- Grant execute permission to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_waitlist_position(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_waitlist_position(TEXT) TO authenticated;