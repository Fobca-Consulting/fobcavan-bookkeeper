-- Create transactions table for client transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  category text NOT NULL,
  account text NOT NULL,
  bank_ledger text,
  reference text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  details text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all transactions
CREATE POLICY "Admin users can manage all transactions"
  ON public.transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Client users can view their own transactions
CREATE POLICY "Client users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    )
  );

-- Client users can create their own transactions
CREATE POLICY "Client users can create their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    )
  );

-- Client users can update their own transactions
CREATE POLICY "Client users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    )
  );

-- Client users can delete their own transactions
CREATE POLICY "Client users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    )
  );

-- Add client_id to customers table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add client_id to vendors table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendors' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.vendors ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update customers RLS policies to include client filtering
DROP POLICY IF EXISTS "Client users can view their customers" ON public.customers;
CREATE POLICY "Client users can view their customers"
  ON public.customers
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    ) OR
    user_has_role(auth.uid(), 'admin') OR 
    user_has_role(auth.uid(), 'customer_manager')
  );

DROP POLICY IF EXISTS "Client users can manage their customers" ON public.customers;
CREATE POLICY "Client users can manage their customers"
  ON public.customers
  FOR ALL
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    ) OR
    user_has_role(auth.uid(), 'admin')
  );

-- Update vendors RLS policies to include client filtering
DROP POLICY IF EXISTS "Client users can view their vendors" ON public.vendors;
CREATE POLICY "Client users can view their vendors"
  ON public.vendors
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    ) OR
    user_has_role(auth.uid(), 'admin') OR 
    user_has_role(auth.uid(), 'vendor_manager') OR 
    user_has_role(auth.uid(), 'purchasing_manager')
  );

DROP POLICY IF EXISTS "Client users can manage their vendors" ON public.vendors;
CREATE POLICY "Client users can manage their vendors"
  ON public.vendors
  FOR ALL
  USING (
    client_id IN (
      SELECT client_id FROM public.client_access
      WHERE user_id = auth.uid()
    ) OR
    user_has_role(auth.uid(), 'admin')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_customers_client_id ON public.customers(client_id);
CREATE INDEX IF NOT EXISTS idx_vendors_client_id ON public.vendors(client_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;