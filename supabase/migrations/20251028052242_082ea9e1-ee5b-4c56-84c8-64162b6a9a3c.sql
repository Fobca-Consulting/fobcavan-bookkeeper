-- Create client revenue tracking table
CREATE TABLE IF NOT EXISTS public.client_revenue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  revenue_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_revenue ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_revenue
CREATE POLICY "Admin users can view all revenue"
  ON public.client_revenue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can manage revenue"
  ON public.client_revenue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_client_revenue_client_id ON public.client_revenue(client_id);
CREATE INDEX IF NOT EXISTS idx_client_revenue_date ON public.client_revenue(revenue_date);

-- Create trigger for updated_at
CREATE TRIGGER update_client_revenue_updated_at
  BEFORE UPDATE ON public.client_revenue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for client_revenue
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_revenue;

-- Enable realtime for clients table
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;

-- Enable realtime for client_activities table
ALTER TABLE public.client_activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_activities;