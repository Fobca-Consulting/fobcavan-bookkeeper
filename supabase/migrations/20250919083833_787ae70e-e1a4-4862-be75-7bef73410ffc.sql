-- Comprehensive Backend Architecture Foundation Migration
-- This migration establishes the core tables and relationships for the modular financial system

-- ============================================================================
-- 1. SETTINGS MODULE
-- ============================================================================

-- System-wide configuration settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  is_system BOOLEAN DEFAULT false, -- system settings cannot be deleted
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company profile and branding
CREATE TABLE public.company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  registration_number TEXT,
  tax_id TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  address JSONB, -- {street, city, state, postal_code, country}
  bank_details JSONB, -- Array of bank account details
  fiscal_year_start DATE,
  base_currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  number_format JSONB DEFAULT '{"decimal_places": 2, "thousand_separator": ",", "decimal_separator": "."}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. ENHANCED USER MANAGEMENT & PERMISSIONS
-- ============================================================================

-- Enhanced user roles with hierarchical structure
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0, -- Higher level = more permissions
  is_system BOOLEAN DEFAULT false, -- System roles cannot be deleted
  permissions JSONB DEFAULT '[]'::jsonb, -- Array of permission strings
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User role assignments (many-to-many)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Module-specific permissions
CREATE TABLE public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  resource_type TEXT, -- table, function, api_endpoint
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_name, permission_name)
);

-- ============================================================================
-- 3. CLIENT MANAGEMENT MODULE
-- ============================================================================

-- Master client records
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  legal_name TEXT,
  client_type TEXT DEFAULT 'individual', -- individual, company, partnership
  industry TEXT,
  registration_number TEXT,
  tax_id TEXT,
  website TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  credit_rating TEXT, -- A, B, C, D
  onboarding_date DATE DEFAULT CURRENT_DATE,
  relationship_manager_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client contact persons
CREATE TABLE public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client addresses
CREATE TABLE public.client_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'business', -- business, billing, shipping, mailing
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. ENHANCED ACCOUNTS MODULE (CHART OF ACCOUNTS)
-- ============================================================================

-- Account categories for organization
CREATE TABLE public.account_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL, -- asset, liability, equity, income, expense
  parent_id UUID REFERENCES public.account_categories(id),
  code_prefix TEXT,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced chart of accounts
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  account_type TEXT NOT NULL, -- asset, liability, equity, income, expense
  category_id UUID REFERENCES public.account_categories(id),
  parent_id UUID REFERENCES public.accounts(id),
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  allow_manual_entries BOOLEAN DEFAULT true,
  require_project BOOLEAN DEFAULT false,
  require_department BOOLEAN DEFAULT false,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  level INTEGER DEFAULT 0, -- Account hierarchy level
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. ENHANCED TRANSACTIONS MODULE
-- ============================================================================

-- Transaction categories for classification
CREATE TABLE public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.transaction_categories(id),
  transaction_type TEXT, -- income, expense, transfer
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_number TEXT,
  transaction_type TEXT NOT NULL, -- income, expense, transfer, adjustment
  category_id UUID REFERENCES public.transaction_categories(id),
  customer_id UUID REFERENCES public.customers(id),
  vendor_id UUID REFERENCES public.vendors(id),
  currency TEXT DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, pending, approved, posted, cancelled
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  notes TEXT,
  attachment_urls JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction line items (double-entry bookkeeping)
CREATE TABLE public.transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.0,
  base_currency_amount DECIMAL(15,2), -- Amount in base currency
  line_number INTEGER NOT NULL,
  project_id UUID, -- For project accounting
  department_id UUID, -- For departmental accounting
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. INVOICES MODULE
-- ============================================================================

-- Invoice templates for customization
CREATE TABLE public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- sales, purchase, quote, credit_note
  content JSONB NOT NULL, -- Template structure and styling
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL DEFAULT 'sales', -- sales, purchase, credit_note, debit_note
  customer_id UUID REFERENCES public.customers(id),
  vendor_id UUID REFERENCES public.vendors(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  po_number TEXT, -- Purchase order reference
  template_id UUID REFERENCES public.invoice_templates(id),
  currency TEXT DEFAULT 'USD',
  exchange_rate DECIMAL(10,6) DEFAULT 1.0,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  status TEXT DEFAULT 'draft', -- draft, sent, viewed, partial, paid, overdue, cancelled
  payment_terms TEXT DEFAULT 'net_30',
  notes TEXT,
  terms_conditions TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  line_total DECIMAL(15,2) GENERATED ALWAYS AS (
    (quantity * unit_price) - discount_amount + tax_amount
  ) STORED,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. MULTI-CURRENCY MODULE
-- ============================================================================

-- Currency definitions
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- ISO 4217 code (USD, EUR, etc.)
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  is_base_currency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exchange rates with historical tracking
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT, -- manual, api, bank
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_currency, to_currency, effective_date)
);

-- ============================================================================
-- 8. BANK RECONCILIATION MODULE
-- ============================================================================

-- Bank account definitions
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'checking', -- checking, savings, credit_card, loan
  currency TEXT DEFAULT 'USD',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  bank_balance DECIMAL(15,2) DEFAULT 0, -- From bank statement
  is_active BOOLEAN DEFAULT true,
  last_reconciled_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bank statements
CREATE TABLE public.bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
  statement_date DATE NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL,
  closing_balance DECIMAL(15,2) NOT NULL,
  total_credits DECIMAL(15,2) DEFAULT 0,
  total_debits DECIMAL(15,2) DEFAULT 0,
  statement_file_url TEXT,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bank transactions from statements
CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_statement_id UUID NOT NULL REFERENCES public.bank_statements(id),
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2),
  is_reconciled BOOLEAN DEFAULT false,
  matched_transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 9. JOURNAL POSTING MODULE
-- ============================================================================

-- Journal entry templates
CREATE TABLE public.journal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_lines JSONB NOT NULL, -- Pre-defined journal lines
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Manual journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT NOT NULL UNIQUE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference TEXT,
  template_id UUID REFERENCES public.journal_templates(id),
  currency TEXT DEFAULT 'USD',
  total_debits DECIMAL(15,2) DEFAULT 0,
  total_credits DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, pending, posted, reversed
  posted_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  reversal_entry_id UUID REFERENCES public.journal_entries(id),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Journal entry lines
CREATE TABLE public.journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 10. INVESTMENTS MODULE
-- ============================================================================

-- Investment types
CREATE TABLE public.investment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- stocks, bonds, mutual_funds, real_estate, etc.
  description TEXT,
  risk_level TEXT, -- low, medium, high
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Investment portfolio
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  investment_type_id UUID NOT NULL REFERENCES public.investment_types(id),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  quantity DECIMAL(15,6) NOT NULL DEFAULT 1,
  current_price DECIMAL(15,2),
  current_value DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  maturity_date DATE,
  interest_rate DECIMAL(5,4),
  status TEXT DEFAULT 'active', -- active, matured, sold
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Investment transactions (buy, sell, dividend, etc.)
CREATE TABLE public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id),
  transaction_type TEXT NOT NULL, -- buy, sell, dividend, interest, split
  transaction_date DATE NOT NULL,
  quantity DECIMAL(15,6) DEFAULT 0,
  price_per_unit DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  fees DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  related_transaction_id UUID REFERENCES public.transactions(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 11. REPORTS MODULE
-- ============================================================================

-- Report definitions
CREATE TABLE public.report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- financial, operational, analytical
  category TEXT, -- income_statement, balance_sheet, cash_flow, etc.
  description TEXT,
  query_template TEXT NOT NULL, -- SQL template with parameters
  parameters JSONB DEFAULT '[]'::jsonb, -- Report parameter definitions
  output_format JSONB DEFAULT '["pdf", "excel", "csv"]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report schedules for automated generation
CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_definition_id UUID NOT NULL REFERENCES public.report_definitions(id),
  name TEXT NOT NULL,
  schedule_expression TEXT NOT NULL, -- Cron expression
  parameters JSONB DEFAULT '{}'::jsonb,
  output_format TEXT DEFAULT 'pdf',
  recipients JSONB DEFAULT '[]'::jsonb, -- Email addresses
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 12. AUDIT TRAIL MODULE
-- ============================================================================

-- Comprehensive audit trail
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_fields JSONB, -- Array of changed field names
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  module_name TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_audit_trail_table_record ON public.audit_trail(table_name, record_id);
CREATE INDEX idx_audit_trail_user_date ON public.audit_trail(user_id, created_at DESC);
CREATE INDEX idx_audit_trail_action ON public.audit_trail(action);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update timestamp trigger function (reuse existing)
-- This should already exist, but including for completeness

-- Function to generate next number in sequence
CREATE OR REPLACE FUNCTION public.get_next_sequence_number(sequence_name TEXT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  formatted_num TEXT;
BEGIN
  -- Get or create sequence
  EXECUTE format('SELECT COALESCE(MAX(CAST(SUBSTRING(%I FROM ''^[A-Z]*(\d+)$'') AS INTEGER)), 0) + 1 FROM %I WHERE %I IS NOT NULL', 
    sequence_name || '_number', sequence_name || 's', sequence_name || '_number');
  
  -- Format with appropriate prefix and padding
  CASE sequence_name
    WHEN 'transaction' THEN
      formatted_num := 'TXN' || LPAD(next_num::TEXT, 6, '0');
    WHEN 'invoice' THEN
      formatted_num := 'INV' || LPAD(next_num::TEXT, 6, '0');
    WHEN 'journal_entry' THEN
      formatted_num := 'JE' || LPAD(next_num::TEXT, 6, '0');
    ELSE
      formatted_num := UPPER(LEFT(sequence_name, 3)) || LPAD(next_num::TEXT, 6, '0');
  END CASE;
  
  RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all new tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BASIC RLS POLICIES (Admin-only for setup, will be enhanced per module)
-- ============================================================================

-- Admin-only policies for system tables
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage company profile" ON public.company_profile FOR ALL USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (user_has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage module permissions" ON public.module_permissions FOR ALL USING (user_has_role(auth.uid(), 'admin'));

-- Client management policies
CREATE POLICY "Admins and managers can manage clients" ON public.clients FOR ALL USING (
  user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager')
);
CREATE POLICY "Admins and managers can manage client contacts" ON public.client_contacts FOR ALL USING (
  user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager')
);
CREATE POLICY "Admins and managers can manage client addresses" ON public.client_addresses FOR ALL USING (
  user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'manager')
);

-- Basic financial data policies (will be enhanced per module requirements)
CREATE POLICY "Financial users can view accounts" ON public.accounts FOR SELECT USING (
  user_has_role(auth.uid(), 'admin') OR 
  user_has_role(auth.uid(), 'accountant') OR 
  user_has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and accountants can manage accounts" ON public.accounts FOR INSERT USING (
  user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'accountant')
);

CREATE POLICY "Admins and accountants can update accounts" ON public.accounts FOR UPDATE USING (
  user_has_role(auth.uid(), 'admin') OR user_has_role(auth.uid(), 'accountant')
);

-- Audit trail policies
CREATE POLICY "Admins can view audit trail" ON public.audit_trail FOR SELECT USING (
  user_has_role(auth.uid(), 'admin')
);

-- Insert default system roles
INSERT INTO public.roles (name, display_name, description, level, is_system, permissions) VALUES
('admin', 'System Administrator', 'Full system access', 100, true, '["*"]'::jsonb),
('manager', 'Manager', 'Management level access', 80, true, '["read:*", "write:customers", "write:vendors", "write:transactions"]'::jsonb),
('accountant', 'Accountant', 'Financial data access', 70, true, '["read:*", "write:accounts", "write:transactions", "write:journal_entries"]'::jsonb),
('staff', 'Staff User', 'Basic operational access', 50, true, '["read:customers", "read:vendors", "write:transactions"]'::jsonb),
('viewer', 'Viewer', 'Read-only access', 10, true, '["read:reports", "read:customers", "read:vendors"]'::jsonb);

-- Insert default company profile
INSERT INTO public.company_profile (name, fiscal_year_start, base_currency) VALUES
('Your Company Name', DATE_TRUNC('year', CURRENT_DATE), 'USD');

-- Insert basic system settings
INSERT INTO public.system_settings (key, value, category, description, data_type) VALUES
('currency.base', '"USD"', 'financial', 'Base currency for the system', 'string'),
('accounting.fiscal_year_start', '"01-01"', 'financial', 'Fiscal year start date (MM-DD format)', 'string'),
('formats.date', '"YYYY-MM-DD"', 'display', 'Default date format', 'string'),
('formats.number_decimal_places', '2', 'display', 'Default decimal places for numbers', 'number'),
('tax.default_rate', '0.00', 'financial', 'Default tax rate percentage', 'number'),
('reports.retention_days', '2555', 'system', 'Report retention period in days (7 years)', 'number');

-- Insert basic currencies
INSERT INTO public.currencies (code, name, symbol, is_base_currency) VALUES
('USD', 'US Dollar', '$', true),
('EUR', 'Euro', '€', false),
('GBP', 'British Pound', '£', false),
('CAD', 'Canadian Dollar', 'C$', false),
('AUD', 'Australian Dollar', 'A$', false);

-- Insert basic account categories
INSERT INTO public.account_categories (name, account_type, code_prefix, sort_order) VALUES
('Current Assets', 'asset', '1', 1),
('Fixed Assets', 'asset', '2', 2),
('Current Liabilities', 'liability', '3', 3),
('Long-term Liabilities', 'liability', '4', 4),
('Equity', 'equity', '5', 5),
('Revenue', 'income', '6', 6),
('Cost of Goods Sold', 'expense', '7', 7),
('Operating Expenses', 'expense', '8', 8);

-- Add update triggers to all tables
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_profile_updated_at BEFORE UPDATE ON public.company_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON public.client_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_addresses_updated_at BEFORE UPDATE ON public.client_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_categories_updated_at BEFORE UPDATE ON public.account_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transaction_categories_updated_at BEFORE UPDATE ON public.transaction_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_templates_updated_at BEFORE UPDATE ON public.journal_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_definitions_updated_at BEFORE UPDATE ON public.report_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON public.report_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();