-- Enhanced Inventory Management System
-- Create inventory locations table
CREATE TABLE public.inventory_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_of_measure TEXT DEFAULT 'pcs',
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  track_serials BOOLEAN DEFAULT false,
  track_lots BOOLEAN DEFAULT false,
  expiry_tracking BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inventory stock table (per location)
CREATE TABLE public.inventory_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(item_id, location_id)
);

-- Serial/Lot tracking table
CREATE TABLE public.inventory_serials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  serial_number TEXT,
  lot_number TEXT,
  expiry_date DATE,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Purchase Orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  vendor_id UUID,
  location_id UUID NOT NULL REFERENCES public.inventory_locations(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'received', 'cancelled')),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Purchase Order Items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Customer Management System
-- Enhanced customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  current_balance DECIMAL(10,2) DEFAULT 0,
  payment_terms_days INTEGER DEFAULT 30,
  tax_exempt BOOLEAN DEFAULT false,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  customer_type TEXT DEFAULT 'regular' CHECK (customer_type IN ('regular', 'wholesale', 'vip')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer contacts/communications
CREATE TABLE public.customer_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'note', 'follow_up')),
  subject TEXT,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customer statements
CREATE TABLE public.customer_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  statement_date DATE NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  opening_balance DECIMAL(10,2) DEFAULT 0,
  closing_balance DECIMAL(10,2) DEFAULT 0,
  total_charges DECIMAL(10,2) DEFAULT 0,
  total_payments DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendors table (enhanced)
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  payment_terms_days INTEGER DEFAULT 30,
  tax_id TEXT,
  vendor_type TEXT DEFAULT 'supplier' CHECK (vendor_type IN ('supplier', 'service', 'contractor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory management
CREATE POLICY "Authenticated users can view inventory locations" ON public.inventory_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory locations" ON public.inventory_locations FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view inventory items" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory items" ON public.inventory_items FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view inventory stock" ON public.inventory_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory stock" ON public.inventory_stock FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view inventory serials" ON public.inventory_serials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory serials" ON public.inventory_serials FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage purchase orders" ON public.purchase_orders FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view purchase order items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage purchase order items" ON public.purchase_order_items FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

-- Create RLS policies for customer management
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view customer communications" ON public.customer_communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage customer communications" ON public.customer_communications FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view customer statements" ON public.customer_statements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage customer statements" ON public.customer_statements FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view vendors" ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage vendors" ON public.vendors FOR ALL TO authenticated USING (user_has_role(auth.uid(), 'admin'));

-- Insert sample data
-- Sample locations
INSERT INTO public.inventory_locations (name, address, description) VALUES 
('Main Warehouse', '123 Storage St, City, State', 'Primary storage facility'),
('Retail Store', '456 Main St, City, State', 'Front store location'),
('Secondary Warehouse', '789 Industrial Blvd, City, State', 'Overflow storage');

-- Sample customers
INSERT INTO public.customers (customer_code, name, email, phone, address, credit_limit, payment_terms_days, customer_type) VALUES
('CUST001', 'Acme Corporation', 'accounting@acme.com', '+1-555-0123', '100 Business Ave, Suite 200', 50000.00, 30, 'wholesale'),
('CUST002', 'Smith Enterprises', 'john@smithent.com', '+1-555-0124', '200 Commerce St', 25000.00, 15, 'regular'),
('CUST003', 'Johnson LLC', 'info@johnsonllc.com', '+1-555-0125', '300 Trade Center', 75000.00, 45, 'vip');

-- Sample vendors
INSERT INTO public.vendors (vendor_code, name, email, phone, address, payment_terms_days, vendor_type) VALUES
('VEND001', 'Tech Supplies Inc', 'orders@techsupplies.com', '+1-555-0200', '500 Supplier Row', 30, 'supplier'),
('VEND002', 'Office Equipment Co', 'sales@officeequip.com', '+1-555-0201', '600 Equipment Ave', 15, 'supplier'),
('VEND003', 'Maintenance Services', 'service@maintenance.com', '+1-555-0202', '700 Service St', 7, 'service');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_inventory_locations_updated_at BEFORE UPDATE ON public.inventory_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_serials_updated_at BEFORE UPDATE ON public.inventory_serials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();