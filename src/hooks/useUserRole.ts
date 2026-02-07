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
          .select('role, organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !roles) {
          setRoleData({
            role: 'customer',
            organizationId: null,
            organizationName: null,
          });
        } else {
          // Buscar nome da organização separadamente se existir
          let orgName: string | null = null;
          if (roles.organization_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('name')
              .eq('id', roles.organization_id)
              .maybeSingle();
            orgName = org?.name || null;
          }

          setRoleData({
            role: roles.role as UserRole,
            organizationId: roles.organization_id,
            organizationName: orgName,
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
