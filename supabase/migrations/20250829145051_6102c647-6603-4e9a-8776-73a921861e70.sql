-- Remove the overly permissive policy that allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- The existing policies already provide the necessary access:
-- 1. "Users can view their own profile" - allows users to see only their own profile
-- 2. "Admins can view all profiles" - allows admins to see all profiles
-- This ensures proper access control without exposing sensitive data