-- Expand allowed roles to include client and manager variants used across policies
-- Drop existing CHECK constraint safely and recreate with a broader allowed set
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (
  role IS NULL OR role IN (
    'admin',
    'manager',
    'staff',
    'client',
    'vendor_manager',
    'customer_manager',
    'purchasing_manager'
  )
);

-- Optional: ensure updated_at is maintained if such trigger exists elsewhere; no changes here
