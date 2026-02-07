import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface ReportStats {
  totalRevenue: number;
  totalAppointments: number;
  newCustomers: number;
  averageTicket: number;
  noShowRate: number;
  completionRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  appointments: number;
}

export interface ServiceStats {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  category: string | null;
}

export interface CustomerStats {
  id: string;
  name: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string | null;
}

export function useReportsData(periodDays: number = 30) {
  const { organization } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalAppointments: 0,
    newCustomers: 0,
    averageTicket: 0,
    noShowRate: 0,
    completionRate: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topServices, setTopServices] = useState<ServiceStats[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerStats[]>([]);

  const fetchData = useCallback(async () => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Fetch appointments in the period
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, status, price, scheduled_at, service_id, customer_id')
        .eq('organization_id', organization.id)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString());

      // Fetch new customers in the period
      const { data: newCustomerData } = await supabase
        .from('customers')
        .select('id')
        .eq('organization_id', organization.id)
        .gte('created_at', startDate.toISOString());

      // Fetch all services for mapping
      const { data: services } = await supabase
        .from('services')
        .select('id, name, category:service_categories(name)')
        .eq('organization_id', organization.id);

      // Calculate stats
      const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
      const noShowAppointments = appointments?.filter(a => a.status === 'no_show') || [];
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled') || [];

      const totalRevenue = completedAppointments.reduce((sum, a) => sum + Number(a.price), 0);
      const totalAppointments = appointments?.length || 0;
      const completionRate = totalAppointments > 0 
        ? (completedAppointments.length / totalAppointments) * 100 
        : 0;
      const noShowRate = totalAppointments > 0 
        ? (noShowAppointments.length / totalAppointments) * 100 
        : 0;
      const averageTicket = completedAppointments.length > 0 
        ? totalRevenue / completedAppointments.length 
        : 0;

      setStats({
        totalRevenue,
        totalAppointments,
        newCustomers: newCustomerData?.length || 0,
        averageTicket,
        noShowRate,
        completionRate,
      });

      // Calculate monthly revenue (last 6 months)
      const monthlyData: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        
        const { data: monthAppointments } = await supabase
          .from('appointments')
          .select('price, status')
          .eq('organization_id', organization.id)
          .eq('status', 'completed')
          .gte('scheduled_at', monthStart.toISOString())
          .lte('scheduled_at', monthEnd.toISOString());

        const monthRevenue = monthAppointments?.reduce((sum, a) => sum + Number(a.price), 0) || 0;
        
        monthlyData.push({
          month: format(monthStart, 'MMM', { locale: require('date-fns/locale/pt-BR').ptBR }),
          revenue: monthRevenue,
          appointments: monthAppointments?.length || 0,
        });
      }
      setMonthlyRevenue(monthlyData);

      // Calculate service stats
      const serviceMap = new Map<string, { bookings: number; revenue: number }>();
      completedAppointments.forEach(apt => {
        const existing = serviceMap.get(apt.service_id) || { bookings: 0, revenue: 0 };
        serviceMap.set(apt.service_id, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + Number(apt.price),
        });
      });

      const serviceStats: ServiceStats[] = [];
      serviceMap.forEach((value, serviceId) => {
        const service = services?.find(s => s.id === serviceId);
        if (service) {
          serviceStats.push({
            id: serviceId,
            name: service.name,
            bookings: value.bookings,
            revenue: value.revenue,
            category: (service.category as any)?.name || null,
          });
        }
      });
      serviceStats.sort((a, b) => b.revenue - a.revenue);
      setTopServices(serviceStats.slice(0, 5));

      // Fetch top customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, total_visits, total_spent, last_visit_at')
        .eq('organization_id', organization.id)
        .order('total_spent', { ascending: false })
        .limit(5);

      setTopCustomers(
        customers?.map(c => ({
          id: c.id,
          name: c.name,
          totalVisits: c.total_visits,
          totalSpent: Number(c.total_spent),
          lastVisit: c.last_visit_at,
        })) || []
      );

    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id, periodDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    monthlyRevenue,
    topServices,
    topCustomers,
    isLoading,
    refetch: fetchData,
  };
}
