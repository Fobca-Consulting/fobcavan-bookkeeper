
-- Function to get user email securely
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TABLE (email TEXT) 
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with security definer, meaning it executes with the
  -- privileges of the function creator, not the calling user.
  RETURN QUERY
    SELECT au.email::TEXT
    FROM auth.users au
    WHERE au.id = user_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email TO authenticated;
