-- Fix critical security vulnerability: Customer data exposed to all users
-- Remove overly permissive policy that allows any authenticated user to read all customer data
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

-- Create restrictive role-based policies for customer data access
-- Only admins can view all customer data
CREATE POLICY "Only admins can view customers" 
ON public.customers 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::text));

-- Staff with customer management role can view customers (if such role exists)
CREATE POLICY "Customer managers can view customers" 
ON public.customers 
FOR SELECT 
USING (user_has_role(auth.uid(), 'customer_manager'::text));

-- Apply same security fix to related customer tables
-- Customer communications - restrict to admins and customer managers only
DROP POLICY IF EXISTS "Authenticated users can view customer communications" ON public.customer_communications;

CREATE POLICY "Only admins can view customer communications" 
ON public.customer_communications 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Customer managers can view customer communications" 
ON public.customer_communications 
FOR SELECT 
USING (user_has_role(auth.uid(), 'customer_manager'::text));

-- Customer statements - restrict to admins and customer managers only  
DROP POLICY IF EXISTS "Authenticated users can view customer statements" ON public.customer_statements;

CREATE POLICY "Only admins can view customer statements" 
ON public.customer_statements 
FOR SELECT 
USING (user_has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Customer managers can view customer statements" 
ON public.customer_statements 
FOR SELECT 
USING (user_has_role(auth.uid(), 'customer_manager'::text));