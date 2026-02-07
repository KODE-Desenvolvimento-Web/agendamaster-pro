-- Criar enum para status de agendamentos
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Criar tabela de categorias de serviços
CREATE TABLE public.service_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 30, -- em minutos
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID, -- opcional, para clientes que também são usuários do sistema
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    is_vip BOOLEAN NOT NULL DEFAULT false,
    total_visits INTEGER NOT NULL DEFAULT 0,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    no_shows INTEGER NOT NULL DEFAULT 0,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de staff (funcionários)
CREATE TABLE public.staff (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    price DECIMAL(10,2) NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de horários de funcionamento
CREATE TABLE public.business_hours (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = domingo
    opens_at TIME NOT NULL DEFAULT '09:00',
    closes_at TIME NOT NULL DEFAULT '18:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organization_id, day_of_week)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies para service_categories
CREATE POLICY "Super admins podem ver todas as categorias"
ON public.service_categories FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver categorias"
ON public.service_categories FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = service_categories.organization_id
));

CREATE POLICY "Admins podem criar categorias"
ON public.service_categories FOR INSERT
WITH CHECK (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem atualizar categorias"
ON public.service_categories FOR UPDATE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem deletar categorias"
ON public.service_categories FOR DELETE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies para services
CREATE POLICY "Super admins podem ver todos os serviços"
ON public.services FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver serviços"
ON public.services FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = services.organization_id
));

CREATE POLICY "Público pode ver serviços ativos"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins podem criar serviços"
ON public.services FOR INSERT
WITH CHECK (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem atualizar serviços"
ON public.services FOR UPDATE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem deletar serviços"
ON public.services FOR DELETE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies para customers
CREATE POLICY "Super admins podem ver todos os clientes"
ON public.customers FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver clientes"
ON public.customers FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = customers.organization_id
));

CREATE POLICY "Admins e staff podem criar clientes"
ON public.customers FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND organization_id = customers.organization_id
    AND role IN ('org_admin', 'staff')
) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins e staff podem atualizar clientes"
ON public.customers FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND organization_id = customers.organization_id
    AND role IN ('org_admin', 'staff')
) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins podem deletar clientes"
ON public.customers FOR DELETE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies para staff
CREATE POLICY "Super admins podem ver todos os funcionários"
ON public.staff FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver funcionários"
ON public.staff FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = staff.organization_id
));

CREATE POLICY "Público pode ver funcionários ativos"
ON public.staff FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins podem criar funcionários"
ON public.staff FOR INSERT
WITH CHECK (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem atualizar funcionários"
ON public.staff FOR UPDATE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "Admins podem deletar funcionários"
ON public.staff FOR DELETE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies para appointments
CREATE POLICY "Super admins podem ver todos os agendamentos"
ON public.appointments FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver agendamentos"
ON public.appointments FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = appointments.organization_id
));

CREATE POLICY "Clientes podem ver seus próprios agendamentos"
ON public.appointments FOR SELECT
USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = appointments.customer_id AND customers.user_id = auth.uid()
));

CREATE POLICY "Admins e staff podem criar agendamentos"
ON public.appointments FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND organization_id = appointments.organization_id
    AND role IN ('org_admin', 'staff')
) OR is_super_admin(auth.uid()));

CREATE POLICY "Público pode criar agendamentos"
ON public.appointments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins e staff podem atualizar agendamentos"
ON public.appointments FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND organization_id = appointments.organization_id
    AND role IN ('org_admin', 'staff')
) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins podem deletar agendamentos"
ON public.appointments FOR DELETE
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies para business_hours
CREATE POLICY "Super admins podem ver todos os horários"
ON public.business_hours FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Membros da organização podem ver horários"
ON public.business_hours FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND organization_id = business_hours.organization_id
));

CREATE POLICY "Público pode ver horários de funcionamento"
ON public.business_hours FOR SELECT
USING (true);

CREATE POLICY "Admins podem gerenciar horários"
ON public.business_hours FOR ALL
USING (
    is_super_admin(auth.uid()) OR 
    is_org_admin(auth.uid(), organization_id)
);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_services_organization ON public.services(organization_id);
CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_customers_organization ON public.customers(organization_id);
CREATE INDEX idx_appointments_organization ON public.appointments(organization_id);
CREATE INDEX idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_staff_organization ON public.staff(organization_id);