import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  organization_id: string;
  appointment_id: string | null;
  customer_id: string | null;
  type: 'email' | 'whatsapp' | 'sms';
  template: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  subject: string | null;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  error_message: string | null;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    sent: 0,
    failed: 0,
  });

  const fetchNotifications = async () => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch from notifications table (will only work after migration is applied)
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setNotifications(data as unknown as Notification[]);
        
        // Calculate stats
        const pending = (data as any[]).filter((n) => n.status === 'pending').length;
        const sent = (data as any[]).filter((n) => n.status === 'sent').length;
        const failed = (data as any[]).filter((n) => n.status === 'failed').length;
        setStats({ pending, sent, failed });
      }
    } catch (error) {
      console.log('Notifications table may not exist yet');
    }

    setIsLoading(false);
  };

  const processNotifications = async () => {
    try {
      const response = await supabase.functions.invoke('send-notifications', {
        body: { batch_size: 10 },
      });

      if (response.error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível processar as notificações.',
          variant: 'destructive',
        });
        return;
      }

      const { sent, failed } = response.data;
      
      if (sent > 0 || failed > 0) {
        toast({
          title: 'Notificações processadas',
          description: `${sent} enviadas, ${failed} falharam`,
        });
        fetchNotifications();
      } else {
        toast({
          title: 'Sem notificações pendentes',
          description: 'Não há notificações para processar no momento.',
        });
      }
    } catch (error) {
      console.error('Error processing notifications:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar notificações.',
        variant: 'destructive',
      });
    }
  };

  const cancelNotification = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'cancelled' as const } : n)
      );

      toast({
        title: 'Sucesso',
        description: 'Notificação cancelada.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a notificação.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [organization?.id]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!organization?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organization.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  return {
    notifications,
    isLoading,
    stats,
    processNotifications,
    cancelNotification,
    refetch: fetchNotifications,
  };
}
