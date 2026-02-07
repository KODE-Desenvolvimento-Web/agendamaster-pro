import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'org_admin' | 'staff' | 'customer';

export interface UserRoleData {
  role: UserRole;
  organizationId: string | null;
  organizationName: string | null;
}

export function useUserRole(user: User | null) {
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRoleData(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select(`
            role,
            organization_id,
            organizations(name)
          `)
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (error || !roles) {
          // Usuário sem role ainda - considerar como customer
          setRoleData({
            role: 'customer',
            organizationId: null,
            organizationName: null,
          });
        } else {
          setRoleData({
            role: roles.role as UserRole,
            organizationId: roles.organization_id,
            organizationName: (roles.organizations as { name: string } | null)?.name || null,
          });
        }
      } catch (err) {
        console.error('Erro ao buscar role:', err);
        setRoleData({
          role: 'customer',
          organizationId: null,
          organizationName: null,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [user?.id]);

  return { roleData, isLoading };
}
