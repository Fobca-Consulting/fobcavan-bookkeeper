-- Add unique constraint on client_access if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'client_access_user_id_client_id_key'
  ) THEN
    ALTER TABLE public.client_access ADD CONSTRAINT client_access_user_id_client_id_key UNIQUE (user_id, client_id);
  END IF;
END $$;

-- Add policy to allow admins to view ALL transactions across all clients
CREATE POLICY "Admin users can view all transactions"
ON public.transactions
FOR SELECT
USING (user_has_role(auth.uid(), 'admin'::text));

-- Also add policies to allow client users to see transactions in their client portals
-- (already exists via client_access lookup, but let's ensure it works with the new accounting_periods check)