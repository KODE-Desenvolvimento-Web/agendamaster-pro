import { useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  UserX,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAppointments, AppointmentStatus } from '@/hooks/useAppointments';
import { useCustomers } from '@/hooks/useCustomers';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';

const statusConfig: Record<AppointmentStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confirmed: { label: 'Confirmado', icon: CheckCircle2, className: 'text-success bg-success/10' },
  pending: { label: 'Pendente', icon: Clock, className: 'text-warning bg-warning/10' },
  no_show: { label: 'Não Compareceu', icon: XCircle, className: 'text-destructive bg-destructive/10' },
  cancelled: { label: 'Cancelado', icon: XCircle, className: 'text-muted-foreground bg-muted' },
  completed: { label: 'Concluído', icon: CheckCircle2, className: 'text-primary bg-primary/10' },
};

export default function OrgDashboard() {
  const { 
    appointments, 
    isLoading: appointmentsLoading,
    todayStats,
    updateStatus
  } = useAppointments();
  
  const { 
    customers, 
    isLoading: customersLoading 
  } = useCustomers();

  const isLoading = appointmentsLoading || customersLoading;

  // Top customers by total spent
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
      .slice(0, 4);
  }, [customers]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    await updateStatus(appointmentId, newStatus);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
            <p className="mt-1 text-muted-foreground">
              Bem-vindo de volta! Veja o que está acontecendo hoje.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Agenda
              </Link>
            </Button>
            <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth" asChild>
              <Link to="/calendar">
                Novo Agendamento
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Agendamentos Hoje"
            value={todayStats.total}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            title="Confirmados"
            value={todayStats.confirmed}
            icon={<CheckCircle2 className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Aguardando Confirmação"
            value={todayStats.pending}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Receita de Hoje"
            value={`R$ ${todayStats.revenue.toFixed(2)}`}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Agenda de Hoje</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/calendar">
                  Ver Tudo
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-6 w-6 text-muted-foreground" />}
                  title="Nenhum agendamento hoje"
                  description="Comece a agendar para ver os compromissos aqui"
                  action={{
                    label: "Criar Agendamento",
                    onClick: () => window.location.href = '/calendar'
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment) => {
                    const status = statusConfig[appointment.status];
                    const StatusIcon = status.icon;
                    const time = format(new Date(appointment.scheduled_at), 'HH:mm');
                    
                    return (
                      <div
                        key={appointment.id}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border border-border p-4 transition-smooth hover:bg-accent/50",
                          (appointment.status === 'no_show' || appointment.status === 'cancelled') && "opacity-60"
                        )}
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold">{time}</p>
                          <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                        </div>
                        
                        <div className="h-12 w-px bg-border" />
                        
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {appointment.customer ? getInitials(appointment.customer.name) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{appointment.customer?.name || 'Cliente'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {appointment.service?.name || 'Serviço'}
                          </p>
                        </div>
                        
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">R$ {Number(appointment.price).toFixed(2)}</p>
                        </div>
                        
                        <Badge 
                          variant="secondary"
                          className={cn("gap-1 shrink-0", status.className)}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span className="hidden sm:inline">{status.label}</span>
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                              Concluir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'no_show')}>
                              <XCircle className="mr-2 h-4 w-4 text-destructive" />
                              Não Compareceu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                              <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Melhores Clientes
              </CardTitle>
              <CardDescription>Clientes por total gasto</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum cliente cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        index === 0 && "bg-yellow-500/10 text-yellow-600",
                        index === 1 && "bg-gray-400/10 text-gray-500",
                        index === 2 && "bg-amber-600/10 text-amber-700",
                        index > 2 && "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.total_visits} visitas
                        </p>
                      </div>
                      <p className="text-sm font-medium text-success">
                        R$ {Number(customer.total_spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/customers">
                  Ver Todos os Clientes
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/services">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Gerenciar Serviços</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/customers">
                  <Users className="h-5 w-5 text-primary" />
                  <span>CRM de Clientes</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/reports">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>Ver Relatórios</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/settings/notifications">
                  <UserX className="h-5 w-5 text-destructive" />
                  <span>Config. No-Show</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
