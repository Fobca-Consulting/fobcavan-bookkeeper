-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive'));

-- Set default to 'active' for existing users
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- Create index for faster status lookups
CREATE INDEX idx_profiles_status ON public.profiles(status);