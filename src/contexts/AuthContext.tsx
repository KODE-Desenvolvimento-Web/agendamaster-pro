import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'org_admin' | 'staff' | 'customer';

export interface User {
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
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  super_admin: {
    id: 'sa-001',
    name: 'Admin Master',
    email: 'admin@agendamaster.com',
    role: 'super_admin',
    avatar: undefined,
  },
  org_admin: {
    id: 'oa-001',
    name: 'Maria Santos',
    email: 'maria@beleza.com',
    role: 'org_admin',
    organizationId: 'org-001',
    organizationName: 'Beleza Total Salon',
  },
};

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
  const [user, setUser] = useState<User | null>(mockUsers.org_admin);
  const [organization, setOrganization] = useState<Organization | null>(mockOrganization);

  const login = async (email: string, password: string, role: UserRole = 'org_admin') => {
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(mockUsers[role] || mockUsers.org_admin);
    if (role !== 'super_admin') {
      setOrganization(mockOrganization);
    } else {
      setOrganization(null);
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(mockUsers[role] || mockUsers.org_admin);
    if (role === 'super_admin') {
      setOrganization(null);
    } else {
      setOrganization(mockOrganization);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        login,
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
