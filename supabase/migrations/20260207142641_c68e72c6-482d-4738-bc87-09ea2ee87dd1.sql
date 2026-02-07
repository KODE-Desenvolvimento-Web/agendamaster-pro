-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'org_admin', 'staff', 'customer');

-- Tabela de roles (separada para segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, organization_id)
);

-- Tabela de organizações
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0070F3',
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'inactive')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perfis
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se é super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Função para verificar se é org_admin de uma organização
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'org_admin'
      AND organization_id = _org_id
  )
$$;

-- Políticas para user_roles
CREATE POLICY "Super admins podem ver todas as roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver roles da sua organização"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  public.is_org_admin(auth.uid(), organization_id)
  OR user_id = auth.uid()
);

CREATE POLICY "Apenas super_admin pode criar org_admin"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  CASE 
    WHEN role = 'super_admin' THEN public.is_super_admin(auth.uid())
    WHEN role = 'org_admin' THEN public.is_super_admin(auth.uid())
    WHEN role IN ('staff', 'customer') THEN 
      public.is_super_admin(auth.uid()) OR 
      public.is_org_admin(auth.uid(), organization_id)
    ELSE false
  END
);

CREATE POLICY "Super admins podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins podem deletar roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Políticas para organizations
CREATE POLICY "Super admins podem ver todas as organizações"
ON public.organizations FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver sua organização"
ON public.organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND organization_id = organizations.id
  )
);

CREATE POLICY "Apenas super_admin pode criar organizações"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins podem atualizar organizações"
ON public.organizations FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem atualizar sua organização"
ON public.organizations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'org_admin'
    AND organization_id = organizations.id
  )
);

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins podem ver todos os perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Org admins podem ver perfis da organização"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur1
    WHERE ur1.user_id = auth.uid() AND ur1.role = 'org_admin'
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = profiles.user_id
      AND ur2.organization_id = ur1.organization_id
    )
  )
);

CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();