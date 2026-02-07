import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'org_admin' | 'staff' | 'customer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  status: 'active' | 'trial' | 'inactive';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (supabaseUser: User) => {
    try {
      // Buscar role do banco de dados
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, organization_id')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      // Buscar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      // Se tiver organization_id, buscar organização separadamente
      let orgData = null;
      if (roleData?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, primary_color, status, plan, created_at')
          .eq('id', roleData.organization_id)
          .maybeSingle();
        orgData = org;
      }

      if (roleData) {
        const appUser: AppUser = {
          id: supabaseUser.id,
          name: profileData?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
          role: roleData.role as UserRole,
          organizationId: roleData.organization_id || undefined,
          organizationName: orgData?.name || undefined,
          avatar: profileData?.avatar_url || undefined,
        };

        setUser(appUser);

        if (orgData) {
          setOrganization({
            id: orgData.id,
            name: orgData.name,
            slug: orgData.slug,
            logo: orgData.logo_url || undefined,
            primaryColor: orgData.primary_color || '#0070F3',
            status: orgData.status as 'active' | 'trial' | 'inactive',
            plan: orgData.plan as 'free' | 'starter' | 'professional' | 'enterprise',
            createdAt: new Date(orgData.created_at),
          });
        } else {
          setOrganization(null);
        }
      } else {
        // Usuário sem role - criar perfil básico
        const appUser: AppUser = {
          id: supabaseUser.id,
          name: profileData?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
          role: 'customer',
          avatar: profileData?.avatar_url || undefined,
        };
        setUser(appUser);
        setOrganization(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Fallback para dados básicos
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        role: 'customer',
      });
      setOrganization(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Usar setTimeout para evitar deadlock
          setTimeout(() => {
            fetchUserData(currentSession.user).finally(() => setIsLoading(false));
          }, 0);
        } else {
          setUser(null);
          setOrganization(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        fetchUserData(existingSession.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOrganization(null);
  };

  const refetchUser = async () => {
    if (session?.user) {
      await fetchUserData(session.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        organization,
        isAuthenticated: !!session,
        isLoading,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
