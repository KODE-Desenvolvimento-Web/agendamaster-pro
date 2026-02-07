-- ============================================================
-- AgendaMaster Pro - Initial Seed Data
-- Execute this file fourth in your Supabase SQL Editor
-- This creates a super admin user and sample organization
-- ============================================================

-- ============================================================
-- IMPORTANT: First create a user in Supabase Auth
-- Then update the UUID below with your user's ID
-- ============================================================

-- Replace 'YOUR_USER_ID' with your actual auth.users id after creating the user
-- You can find it in Authentication > Users in Supabase Dashboard

-- Example: Create super admin role for the first user
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_ID_HERE', 'super_admin');

-- Example: Create profile for the first user
-- INSERT INTO public.profiles (user_id, full_name)
-- VALUES ('YOUR_USER_ID_HERE', 'Admin');

-- ============================================================
-- SAMPLE DATA (Optional - uncomment to use)
-- ============================================================

/*
-- Create a sample organization
INSERT INTO public.organizations (name, slug, email, phone, status, plan)
VALUES (
  'Salão Exemplo',
  'salao-exemplo',
  'contato@salaoexemplo.com',
  '11999999999',
  'active',
  'professional'
);

-- Get the organization ID for subsequent inserts
-- Replace ORG_ID with the actual UUID after running the above

-- Create business hours (Monday to Saturday)
INSERT INTO public.business_hours (organization_id, day_of_week, opens_at, closes_at, is_closed) VALUES
  ('ORG_ID', 0, '09:00', '18:00', true),  -- Sunday (closed)
  ('ORG_ID', 1, '09:00', '19:00', false), -- Monday
  ('ORG_ID', 2, '09:00', '19:00', false), -- Tuesday
  ('ORG_ID', 3, '09:00', '19:00', false), -- Wednesday
  ('ORG_ID', 4, '09:00', '19:00', false), -- Thursday
  ('ORG_ID', 5, '09:00', '19:00', false), -- Friday
  ('ORG_ID', 6, '09:00', '17:00', false); -- Saturday

-- Create sample service categories
INSERT INTO public.service_categories (organization_id, name, color) VALUES
  ('ORG_ID', 'Cabelo', '#8B5CF6'),
  ('ORG_ID', 'Unhas', '#EC4899'),
  ('ORG_ID', 'Estética', '#10B981');

-- Create sample services
INSERT INTO public.services (organization_id, name, description, duration, price, is_active) VALUES
  ('ORG_ID', 'Corte Masculino', 'Corte de cabelo masculino tradicional', 30, 50.00, true),
  ('ORG_ID', 'Corte Feminino', 'Corte de cabelo feminino', 60, 80.00, true),
  ('ORG_ID', 'Manicure', 'Manicure completa', 45, 40.00, true),
  ('ORG_ID', 'Pedicure', 'Pedicure completa', 60, 50.00, true),
  ('ORG_ID', 'Limpeza de Pele', 'Limpeza de pele profunda', 90, 120.00, true);
*/

-- ============================================================
-- ENABLE REALTIME FOR NOTIFICATIONS (Optional)
-- ============================================================

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
