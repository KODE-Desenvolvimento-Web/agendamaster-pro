-- Adicionar foreign key para organizations na tabela user_roles
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;