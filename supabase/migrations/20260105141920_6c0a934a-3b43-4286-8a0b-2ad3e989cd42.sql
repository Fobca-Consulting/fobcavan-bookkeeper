-- Create accounting_periods table to track closed periods
CREATE TABLE public.accounting_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  closed_at timestamp with time zone,
  closed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, period_start, period_end)
);

-- Enable RLS on accounting_periods
ALTER TABLE public.accounting_periods ENABLE ROW LEVEL SECURITY;

-- Policies for accounting_periods
-- Admins can manage all periods
CREATE POLICY "Admins can manage accounting periods"
ON public.accounting_periods
FOR ALL
USING (user_has_role(auth.uid(), 'admin'::text));

-- Client users can view their periods
CREATE POLICY "Client users can view their accounting periods"
ON public.accounting_periods
FOR SELECT
USING (
  client_id IN (
    SELECT client_access.client_id
    FROM client_access
    WHERE client_access.user_id = auth.uid()
  )
);

-- Add client_access record for clients when they are created (link user to their client)
-- First, add a client role to the app_role enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'client' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'client';
  END IF;
END $$;

-- Create trigger for updated_at on accounting_periods
CREATE TRIGGER update_accounting_periods_updated_at
BEFORE UPDATE ON public.accounting_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better query performance
CREATE INDEX idx_accounting_periods_client_id ON public.accounting_periods(client_id);
CREATE INDEX idx_accounting_periods_status ON public.accounting_periods(status);
CREATE INDEX idx_accounting_periods_period ON public.accounting_periods(period_start, period_end);