-- ============================================================
-- AgendaMaster Pro - Row Level Security Policies
-- Execute this file third in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORGANIZATIONS POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todas as organizações"
  ON organizations FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver sua organização"
  ON organizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = organizations.id
  ));

CREATE POLICY "Apenas super_admin pode criar organizações"
  ON organizations FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins podem atualizar organizações"
  ON organizations FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem atualizar sua organização"
  ON organizations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'org_admin'
    AND user_roles.organization_id = organizations.id
  ));

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Super admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver perfis da organização"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles ur1
    WHERE ur1.user_id = auth.uid()
    AND ur1.role = 'org_admin'
    AND EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.user_id = profiles.user_id
      AND ur2.organization_id = ur1.organization_id
    )
  ));

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- USER_ROLES POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todas as roles"
  ON user_roles FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver roles da sua organização"
  ON user_roles FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id) OR user_id = auth.uid());

CREATE POLICY "Apenas super_admin pode criar org_admin"
  ON user_roles FOR INSERT
  WITH CHECK (
    CASE
      WHEN role = 'super_admin' THEN is_super_admin(auth.uid())
      WHEN role = 'org_admin' THEN is_super_admin(auth.uid())
      WHEN role IN ('staff', 'customer') THEN (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id))
      ELSE false
    END
  );

CREATE POLICY "Super admins podem atualizar roles"
  ON user_roles FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins podem deletar roles"
  ON user_roles FOR DELETE
  USING (is_super_admin(auth.uid()));

-- ============================================================
-- SERVICE_CATEGORIES POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todas as categorias"
  ON service_categories FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver categorias"
  ON service_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = service_categories.organization_id
  ));

CREATE POLICY "Admins podem criar categorias"
  ON service_categories FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem atualizar categorias"
  ON service_categories FOR UPDATE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem deletar categorias"
  ON service_categories FOR DELETE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- SERVICES POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todos os serviços"
  ON services FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver serviços"
  ON services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = services.organization_id
  ));

CREATE POLICY "Público pode ver serviços ativos"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem criar serviços"
  ON services FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem atualizar serviços"
  ON services FOR UPDATE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem deletar serviços"
  ON services FOR DELETE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- STAFF POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todos os funcionários"
  ON staff FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver funcionários"
  ON staff FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = staff.organization_id
  ));

CREATE POLICY "Público pode ver funcionários ativos"
  ON staff FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem criar funcionários"
  ON staff FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem atualizar funcionários"
  ON staff FOR UPDATE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins podem deletar funcionários"
  ON staff FOR DELETE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- CUSTOMERS POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todos os clientes"
  ON customers FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver clientes"
  ON customers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = customers.organization_id
  ));

CREATE POLICY "Admins e staff podem criar clientes"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = customers.organization_id
      AND user_roles.role IN ('org_admin', 'staff')
    ) OR is_super_admin(auth.uid())
  );

CREATE POLICY "Admins e staff podem atualizar clientes"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = customers.organization_id
      AND user_roles.role IN ('org_admin', 'staff')
    ) OR is_super_admin(auth.uid())
  );

CREATE POLICY "Admins podem deletar clientes"
  ON customers FOR DELETE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- BUSINESS_HOURS POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todos os horários"
  ON business_hours FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver horários"
  ON business_hours FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = business_hours.organization_id
  ));

CREATE POLICY "Público pode ver horários de funcionamento"
  ON business_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar horários"
  ON business_hours FOR ALL
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- APPOINTMENTS POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todos os agendamentos"
  ON appointments FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver agendamentos"
  ON appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = appointments.organization_id
  ));

CREATE POLICY "Clientes podem ver seus próprios agendamentos"
  ON appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = appointments.customer_id
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Público pode criar agendamentos"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins e staff podem criar agendamentos"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = appointments.organization_id
      AND user_roles.role IN ('org_admin', 'staff')
    ) OR is_super_admin(auth.uid())
  );

CREATE POLICY "Admins e staff podem atualizar agendamentos"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = appointments.organization_id
      AND user_roles.role IN ('org_admin', 'staff')
    ) OR is_super_admin(auth.uid())
  );

CREATE POLICY "Admins podem deletar agendamentos"
  ON appointments FOR DELETE
  USING (is_super_admin(auth.uid()) OR is_org_admin(auth.uid(), organization_id));

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "Super admins podem ver todas notificações"
  ON notifications FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver notificações"
  ON notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.organization_id = notifications.organization_id
  ));

CREATE POLICY "Sistema pode inserir notificações"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar notificações"
  ON notifications FOR UPDATE
  USING (
    is_super_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.organization_id = notifications.organization_id
      AND user_roles.role = 'org_admin'
    )
  );
