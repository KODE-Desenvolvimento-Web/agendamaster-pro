import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_vip: boolean;
  total_visits: number;
  total_spent: number;
  no_shows: number;
  last_visit_at: string | null;
  created_at: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  is_vip?: boolean;
}

export function useCustomers() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organization.id)
      .order('name');

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes.',
        variant: 'destructive',
      });
    } else {
      setCustomers(data || []);
    }

    setIsLoading(false);
  }, [organization?.id, toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (data: CreateCustomerData) => {
    if (!organization?.id) return null;

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        organization_id: organization.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        notes: data.notes || null,
        is_vip: data.is_vip ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o cliente.',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Sucesso',
      description: 'Cliente criado com sucesso!',
    });

    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, data: Partial<CreateCustomerData>) => {
    const { error } = await supabase
      .from('customers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Cliente atualizado com sucesso!',
    });

    await fetchCustomers();
    return true;
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente. Ele pode ter agendamentos associados.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Cliente excluído com sucesso!',
    });

    setCustomers(prev => prev.filter(c => c.id !== id));
    return true;
  };

  const toggleVipStatus = async (id: string, isVip: boolean) => {
    return updateCustomer(id, { is_vip: isVip });
  };

  // Estatísticas
  const stats = {
    total: customers.length,
    vipCount: customers.filter(c => c.is_vip).length,
    noShowRate: customers.length > 0 
      ? Math.round((customers.filter(c => c.no_shows > 0).length / customers.length) * 100) 
      : 0,
    totalRevenue: customers.reduce((acc, c) => acc + Number(c.total_spent), 0),
  };

  return {
    customers,
    isLoading,
    stats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleVipStatus,
    refetch: fetchCustomers,
  };
}
