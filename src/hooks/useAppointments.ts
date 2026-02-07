import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  organization_id: string;
  customer_id: string;
  service_id: string;
  staff_id: string | null;
  scheduled_at: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  staff?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateAppointmentData {
  customer_id: string;
  service_id: string;
  staff_id?: string;
  scheduled_at: string;
  duration: number;
  price: number;
  notes?: string;
  status?: AppointmentStatus;
}

async function checkBookingAvailability(
  organizationId: string,
  staffId: string | null,
  scheduledAt: string,
  duration: number,
  excludeAppointmentId?: string
): Promise<{ available: boolean; message?: string }> {
  try {
    const response = await supabase.functions.invoke('check-booking', {
      body: {
        organization_id: organizationId,
        staff_id: staffId,
        scheduled_at: scheduledAt,
        duration: duration,
        exclude_appointment_id: excludeAppointmentId,
      },
    });

    if (response.error) {
      console.error('Error checking booking:', response.error);
      return { available: true }; // Fallback to allow booking if check fails
    }

    return response.data;
  } catch (error) {
    console.error('Error calling check-booking:', error);
    return { available: true }; // Fallback to allow booking if check fails
  }
}

export function useAppointments(date?: Date) {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(date || new Date());

  const fetchAppointments = useCallback(async (startDate: Date, endDate: Date) => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        service:services(id, name, duration, price),
        staff:staff(id, name)
      `)
      .eq('organization_id', organization.id)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .order('scheduled_at');

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    } else {
      setAppointments(data || []);
    }

    setIsLoading(false);
  }, [organization?.id, toast]);

  const fetchForDay = useCallback((day: Date) => {
    setCurrentDate(day);
    return fetchAppointments(startOfDay(day), endOfDay(day));
  }, [fetchAppointments]);

  const fetchForWeek = useCallback((day: Date) => {
    setCurrentDate(day);
    return fetchAppointments(startOfWeek(day, { weekStartsOn: 0 }), endOfWeek(day, { weekStartsOn: 0 }));
  }, [fetchAppointments]);

  const fetchForMonth = useCallback((day: Date) => {
    setCurrentDate(day);
    return fetchAppointments(startOfMonth(day), endOfMonth(day));
  }, [fetchAppointments]);

  useEffect(() => {
    fetchForDay(currentDate);
  }, [currentDate, fetchForDay]);

  const createAppointment = async (data: CreateAppointmentData) => {
    if (!organization?.id) return null;

    // Check for double-booking
    const availability = await checkBookingAvailability(
      organization.id,
      data.staff_id || null,
      data.scheduled_at,
      data.duration
    );

    if (!availability.available) {
      toast({
        title: 'Horário indisponível',
        description: availability.message || 'Este horário já está ocupado.',
        variant: 'destructive',
      });
      return null;
    }

    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        organization_id: organization.id,
        customer_id: data.customer_id,
        service_id: data.service_id,
        staff_id: data.staff_id || null,
        scheduled_at: data.scheduled_at,
        duration: data.duration,
        price: data.price,
        notes: data.notes || null,
        status: data.status || 'pending',
      })
      .select(`
        *,
        customer:customers(id, name, email, phone),
        service:services(id, name, duration, price),
        staff:staff(id, name)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento.',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Sucesso',
      description: 'Agendamento criado com sucesso!',
    });

    setAppointments(prev => [...prev, newAppointment].sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    ));
    return newAppointment;
  };

  const updateAppointment = async (id: string, data: Partial<CreateAppointmentData>) => {
    if (!organization?.id) return false;

    // If updating time/staff, check for conflicts
    if (data.scheduled_at || data.staff_id !== undefined) {
      const existing = appointments.find(a => a.id === id);
      if (existing) {
        const availability = await checkBookingAvailability(
          organization.id,
          data.staff_id ?? existing.staff_id,
          data.scheduled_at ?? existing.scheduled_at,
          data.duration ?? existing.duration,
          id
        );

        if (!availability.available) {
          toast({
            title: 'Horário indisponível',
            description: availability.message || 'Este horário já está ocupado.',
            variant: 'destructive',
          });
          return false;
        }
      }
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Agendamento atualizado com sucesso!',
    });

    await fetchForDay(currentDate);
    return true;
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
      return false;
    }

    // Atualizar localmente
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );

    // Se marcou como no_show, incrementar contador do cliente
    if (status === 'no_show') {
      const appointment = appointments.find(a => a.id === id);
      if (appointment?.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('no_shows')
          .eq('id', appointment.customer_id)
          .single();
        
        if (customer) {
          await supabase
            .from('customers')
            .update({ no_shows: (customer.no_shows || 0) + 1 })
            .eq('id', appointment.customer_id);
        }
      }
    }

    // Se completou, atualizar stats do cliente
    if (status === 'completed') {
      const appointment = appointments.find(a => a.id === id);
      if (appointment?.customer_id) {
        const { data: customer } = await supabase
          .from('customers')
          .select('total_visits, total_spent')
          .eq('id', appointment.customer_id)
          .single();
        
        if (customer) {
          await supabase
            .from('customers')
            .update({ 
              total_visits: (customer.total_visits || 0) + 1,
              total_spent: (Number(customer.total_spent) || 0) + Number(appointment.price),
              last_visit_at: new Date().toISOString(),
            })
            .eq('id', appointment.customer_id);
        }
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Status atualizado com sucesso!',
    });

    return true;
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o agendamento.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Agendamento excluído com sucesso!',
    });

    setAppointments(prev => prev.filter(a => a.id !== id));
    return true;
  };

  // Estatísticas do dia
  const todayStats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no_show').length,
    revenue: appointments
      .filter(a => a.status === 'confirmed' || a.status === 'completed')
      .reduce((acc, a) => acc + Number(a.price), 0),
  };

  return {
    appointments,
    isLoading,
    currentDate,
    todayStats,
    createAppointment,
    updateAppointment,
    updateStatus,
    deleteAppointment,
    fetchForDay,
    fetchForWeek,
    fetchForMonth,
    setCurrentDate,
    refetch: () => fetchForDay(currentDate),
  };
}
