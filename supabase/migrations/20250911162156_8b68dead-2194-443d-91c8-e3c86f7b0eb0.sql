-- Fix critical security vulnerability: Customer data exposed to all users
-- First drop all existing customer-related policies to clean slate
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Only admins can view customers" ON public.customers;
DROP POLICY IF EXISTS "Customer managers can view customers" ON public.customers;

-- Create secure role-based policies for customer data access
-- Only admins and customer managers can view customer data
CREATE POLICY "Admins and managers can view customers" 
ON public.customers 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'customer_manager'::text)
);

-- Apply same security fix to customer communications
DROP POLICY IF EXISTS "Authenticated users can view customer communications" ON public.customer_communications;
DROP POLICY IF EXISTS "Only admins can view customer communications" ON public.customer_communications;
DROP POLICY IF EXISTS "Customer managers can view customer communications" ON public.customer_communications;

CREATE POLICY "Admins and managers can view customer communications" 
ON public.customer_communications 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'customer_manager'::text)
);

-- Apply same security fix to customer statements
DROP POLICY IF EXISTS "Authenticated users can view customer statements" ON public.customer_statements;
DROP POLICY IF EXISTS "Only admins can view customer statements" ON public.customer_statements;
DROP POLICY IF EXISTS "Customer managers can view customer statements" ON public.customer_statements;

CREATE POLICY "Admins and managers can view customer statements" 
ON public.customer_statements 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'customer_manager'::text)
);