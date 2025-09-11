-- Fix critical security vulnerability: Vendor data exposed to all users
-- Remove overly permissive policy that allows any authenticated user to read all vendor data
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON public.vendors;

-- Create secure role-based policies for vendor data access
-- Only admins and vendor managers can view vendor data
CREATE POLICY "Admins and managers can view vendors" 
ON public.vendors 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'vendor_manager'::text) OR
  user_has_role(auth.uid(), 'purchasing_manager'::text)
);

-- Also secure purchase orders and purchase order items since they contain vendor-related data
DROP POLICY IF EXISTS "Authenticated users can view purchase orders" ON public.purchase_orders;

CREATE POLICY "Admins and managers can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'vendor_manager'::text) OR
  user_has_role(auth.uid(), 'purchasing_manager'::text)
);

DROP POLICY IF EXISTS "Authenticated users can view purchase order items" ON public.purchase_order_items;

CREATE POLICY "Admins and managers can view purchase order items" 
ON public.purchase_order_items 
FOR SELECT 
USING (
  user_has_role(auth.uid(), 'admin'::text) OR 
  user_has_role(auth.uid(), 'vendor_manager'::text) OR
  user_has_role(auth.uid(), 'purchasing_manager'::text)
);