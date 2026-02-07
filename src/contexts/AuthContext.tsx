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
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin email
const ADMIN_EMAIL = 'kode.dev.br@gmail.com';

const mockOrganization: Organization = {
  id: 'org-001',
  name: 'Beleza Total Salon',
  slug: 'beleza-total',
  logo: undefined,
  primaryColor: '#0070F3',
  status: 'active',
  plan: 'professional',
  createdAt: new Date('2024-01-15'),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createAppUser = (supabaseUser: User): AppUser => {
    const isAdmin = supabaseUser.email === ADMIN_EMAIL;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: isAdmin ? 'super_admin' : 'org_admin',
      organizationId: isAdmin ? undefined : 'org-001',
      organizationName: isAdmin ? undefined : 'Beleza Total Salon',
      avatar: undefined,
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const appUser = createAppUser(session.user);
          setUser(appUser);
          
          if (appUser.role !== 'super_admin') {
            setOrganization(mockOrganization);
          } else {
            setOrganization(null);
          }
        } else {
          setUser(null);
          setOrganization(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const appUser = createAppUser(session.user);
        setUser(appUser);
        
        if (appUser.role !== 'super_admin') {
          setOrganization(mockOrganization);
        } else {
          setOrganization(null);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOrganization(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
      if (role === 'super_admin') {
        setOrganization(null);
      } else {
        setOrganization(mockOrganization);
      }
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
        switchRole,
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
