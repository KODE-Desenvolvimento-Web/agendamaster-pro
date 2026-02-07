import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ServiceCategory {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Service {
  id: string;
  organization_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  is_active: boolean;
  created_at: string;
  category?: ServiceCategory | null;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category_id?: string;
  is_active?: boolean;
}

export interface CreateCategoryData {
  name: string;
  color: string;
}

export function useServices() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!organization?.id) return;

    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('organization_id', organization.id)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    setCategories(data || []);
  }, [organization?.id]);

  const fetchServices = useCallback(async () => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('organization_id', organization.id)
      .order('name');

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços.',
        variant: 'destructive',
      });
    } else {
      setServices(data || []);
    }

    setIsLoading(false);
  }, [organization?.id, toast]);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  const createCategory = async (data: CreateCategoryData) => {
    if (!organization?.id) return null;

    const { data: newCategory, error } = await supabase
      .from('service_categories')
      .insert({
        organization_id: organization.id,
        name: data.name,
        color: data.color,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a categoria.',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Sucesso',
      description: 'Categoria criada com sucesso!',
    });

    await fetchCategories();
    return newCategory;
  };

  const createService = async (data: CreateServiceData) => {
    if (!organization?.id) return null;

    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        organization_id: organization.id,
        name: data.name,
        description: data.description || null,
        duration: data.duration,
        price: data.price,
        category_id: data.category_id || null,
        is_active: data.is_active ?? true,
      })
      .select(`
        *,
        category:service_categories(*)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o serviço.',
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Sucesso',
      description: 'Serviço criado com sucesso!',
    });

    setServices(prev => [...prev, newService]);
    return newService;
  };

  const updateService = async (id: string, data: Partial<CreateServiceData>) => {
    const { error } = await supabase
      .from('services')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o serviço.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Serviço atualizado com sucesso!',
    });

    await fetchServices();
    return true;
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o serviço. Ele pode estar sendo usado em agendamentos.',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sucesso',
      description: 'Serviço excluído com sucesso!',
    });

    setServices(prev => prev.filter(s => s.id !== id));
    return true;
  };

  const toggleServiceStatus = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  return {
    services,
    categories,
    isLoading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    createCategory,
    refetch: fetchServices,
  };
}
