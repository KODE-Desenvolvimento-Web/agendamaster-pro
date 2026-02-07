import { useState, useEffect } from 'react';
import { 
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Check,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';

const notificationTemplates = [
  {
    id: 'appointment_created',
    name: 'Agendamento Criado',
    description: 'Enviado imediatamente quando um agendamento é criado',
    channels: ['email', 'whatsapp'],
    enabled: true,
    template: 'Olá {customer_name}! Seu agendamento de {service} em {business_name} foi recebido para {date} às {time}.',
  },
  {
    id: 'appointment_confirmed',
    name: 'Agendamento Confirmado',
    description: 'Enviado quando um agendamento é confirmado',
    channels: ['email', 'whatsapp'],
    enabled: true,
    template: 'Olá {customer_name}! Seu agendamento de {service} em {business_name} está confirmado para {date} às {time}. Até logo!',
  },
  {
    id: 'appointment_reminder',
    name: 'Lembrete',
    description: 'Enviado antes do agendamento',
    channels: ['whatsapp'],
    enabled: true,
    template: 'Lembrete: Você tem um agendamento às {time} para {service} em {business_name}.',
  },
  {
    id: 'appointment_cancelled',
    name: 'Agendamento Cancelado',
    description: 'Enviado quando um agendamento é cancelado',
    channels: ['email', 'whatsapp'],
    enabled: true,
    template: 'Olá {customer_name}, seu agendamento foi cancelado. Gostaria de reagendar?',
  },
  {
    id: 'appointment_completed',
    name: 'Feedback Pós-serviço',
    description: 'Enviado após o agendamento ser concluído',
    channels: ['email'],
    enabled: true,
    template: 'Olá {customer_name}! Obrigado por visitar {business_name}. Adoraríamos ouvir sua opinião.',
  },
];

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const { notifications, stats, isLoading, processNotifications, refetch } = useNotifications();
  const [templates, setTemplates] = useState(notificationTemplates);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleTemplate = (id: string) => {
    setTemplates(prev => 
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
    toast({
      title: 'Template atualizado',
      description: 'As alterações foram salvas.',
    });
  };

  const handleProcessNotifications = async () => {
    setIsProcessing(true);
    await processNotifications();
    setIsProcessing(false);
  };

  const channelIcons = {
    email: Mail,
    whatsapp: MessageSquare,
  };

  const statusBadgeStyles = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    sent: 'bg-success/10 text-success border-success/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
    cancelled: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
            <p className="mt-1 text-muted-foreground">
              Configure mensagens automáticas para seus clientes
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button 
              onClick={handleProcessNotifications}
              disabled={isProcessing || stats.pending === 0}
              className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Processar Fila ({stats.pending})
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.pending}
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="text-warning bg-warning/10">
                    Aguardando
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enviadas</CardDescription>
              <CardTitle className="text-3xl text-success">{stats.sent}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Falharam</CardDescription>
              <CardTitle className="text-3xl text-destructive">{stats.failed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações Recentes
            </CardTitle>
            <CardDescription>
              Últimas notificações enviadas ou pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-12 w-12" />}
                title="Nenhuma notificação"
                description="Notificações aparecerão aqui quando agendamentos forem criados"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.slice(0, 10).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {notification.type === 'email' ? (
                            <Mail className="h-3 w-3" />
                          ) : (
                            <MessageSquare className="h-3 w-3" />
                          )}
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {notification.recipient_email || notification.recipient_phone || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground capitalize">
                          {notification.template.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(statusBadgeStyles[notification.status])}
                        >
                          {notification.status === 'pending' ? 'Pendente' :
                           notification.status === 'sent' ? 'Enviada' :
                           notification.status === 'failed' ? 'Falhou' : 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Modelos de Notificação
            </CardTitle>
            <CardDescription>
              Personalize as mensagens enviadas aos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "rounded-lg border border-border p-4 transition-smooth",
                    !template.enabled && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex gap-1">
                          {template.channels.map((channel) => {
                            const Icon = channelIcons[channel as keyof typeof channelIcons];
                            return (
                              <Badge 
                                key={channel} 
                                variant="secondary" 
                                className="text-xs gap-1"
                              >
                                <Icon className="h-3 w-3" />
                                {channel}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="italic text-muted-foreground">
                          "{template.template}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Modelo</DialogTitle>
                            <DialogDescription>
                              Personalize a mensagem para "{template.name}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="template" className="mb-2 block">
                              Modelo de Mensagem
                            </Label>
                            <Textarea
                              id="template"
                              defaultValue={template.template}
                              rows={4}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Variáveis disponíveis: {'{customer_name}'}, {'{service}'}, {'{date}'}, {'{time}'}, {'{business_name}'}
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancelar</Button>
                            <Button className="bg-gradient-primary">Salvar Alterações</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Settings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-success" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Conecte sua conta via Evolution API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-warning/20 bg-warning/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Não Configurado</p>
                    <p className="text-sm text-muted-foreground">Configure as variáveis de ambiente</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Secrets necessários: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Configurações de Email
              </CardTitle>
              <CardDescription>
                Configure o Resend para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-warning/20 bg-warning/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Não Configurado</p>
                    <p className="text-sm text-muted-foreground">Configure a API key do Resend</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Secrets necessários: RESEND_API_KEY, RESEND_FROM_EMAIL
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
