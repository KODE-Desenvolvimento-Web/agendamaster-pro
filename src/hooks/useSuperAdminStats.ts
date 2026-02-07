import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SuperAdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  totalAppointments: number;
  totalCustomers: number;
  monthlyRevenue: number;
  trialConversionRate: number;
}

export interface OrganizationWithStats {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: 'active' | 'trial' | 'inactive';
  plan: string;
  trial_ends_at: string | null;
  created_at: string;
  appointmentsCount: number;
  customersCount: number;
  monthlyRevenue: number;
}

const planPrices: Record<string, number> = {
  free: 0,
  starter: 49,
  professional: 299,
  enterprise: 599,
};

export function useSuperAdminStats() {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    trialOrganizations: 0,
    totalAppointments: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    trialConversionRate: 0,
  });
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);

    try {
      // Fetch all organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Fetch appointments count per organization
      const { data: appointmentsCounts } = await supabase
        .from('appointments')
        .select('organization_id');

      // Fetch customers count per organization
      const { data: customersCounts } = await supabase
        .from('customers')
        .select('organization_id');

      // Fetch completed appointments for revenue (this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('organization_id, price')
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth.toISOString());

      // Calculate per-org stats
      const orgAppointments: Record<string, number> = {};
      const orgCustomers: Record<string, number> = {};
      const orgRevenue: Record<string, number> = {};

      appointmentsCounts?.forEach((apt) => {
        orgAppointments[apt.organization_id] = (orgAppointments[apt.organization_id] || 0) + 1;
      });

      customersCounts?.forEach((cust) => {
        orgCustomers[cust.organization_id] = (orgCustomers[cust.organization_id] || 0) + 1;
      });

      completedAppointments?.forEach((apt) => {
        orgRevenue[apt.organization_id] = (orgRevenue[apt.organization_id] || 0) + Number(apt.price);
      });

      // Enrich organizations with stats
      const enrichedOrgs: OrganizationWithStats[] = (orgs || []).map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        email: org.email,
        phone: org.phone,
        status: org.status as 'active' | 'trial' | 'inactive',
        plan: org.plan,
        trial_ends_at: (org as any).trial_ends_at || null,
        created_at: org.created_at,
        appointmentsCount: orgAppointments[org.id] || 0,
        customersCount: orgCustomers[org.id] || 0,
        monthlyRevenue: orgRevenue[org.id] || 0,
      }));

      setOrganizations(enrichedOrgs);

      // Calculate global stats
      const totalOrgs = enrichedOrgs.length;
      const activeOrgs = enrichedOrgs.filter((o) => o.status === 'active').length;
      const trialOrgs = enrichedOrgs.filter((o) => o.status === 'trial').length;
      const totalAppts = appointmentsCounts?.length || 0;
      const totalCusts = customersCounts?.length || 0;

      // MRR based on plan prices
      const mrr = enrichedOrgs
        .filter((o) => o.status === 'active')
        .reduce((sum, o) => sum + (planPrices[o.plan] || 0), 0);

      // Trial conversion rate (active / (active + trial + inactive that were trial))
      const conversionRate = totalOrgs > 0 ? (activeOrgs / totalOrgs) * 100 : 0;

      setStats({
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        totalAppointments: totalAppts,
        totalCustomers: totalCusts,
        monthlyRevenue: mrr,
        trialConversionRate: Math.round(conversionRate),
      });
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganizationStatus = async (orgId: string, status: 'active' | 'trial' | 'inactive') => {
    const { error } = await supabase
      .from('organizations')
      .update({ status })
      .eq('id', orgId);

    if (!error) {
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? { ...org, status } : org))
      );
      // Recalculate stats
      fetchStats();
    }

    return !error;
  };

  const updateOrganizationPlan = async (orgId: string, plan: string) => {
    const { error } = await supabase
      .from('organizations')
      .update({ plan })
      .eq('id', orgId);

    if (!error) {
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? { ...org, plan } : org))
      );
      fetchStats();
    }

    return !error;
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    organizations,
    isLoading,
    refetch: fetchStats,
    updateOrganizationStatus,
    updateOrganizationPlan,
  };
}
