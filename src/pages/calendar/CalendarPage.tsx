import { useState, useMemo } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ban
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAppointments, AppointmentStatus, CreateAppointmentData } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useCustomers } from '@/hooks/useCustomers';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EmptyState } from '@/components/ui/EmptyState';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const statusConfig: Record<AppointmentStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confirmed: { label: 'Confirmado', icon: CheckCircle2, className: 'text-success bg-success/10 border-success/40' },
  pending: { label: 'Pendente', icon: AlertCircle, className: 'text-warning bg-warning/10 border-warning/40' },
  completed: { label: 'Concluído', icon: CheckCircle2, className: 'text-primary bg-primary/10 border-primary/40' },
  no_show: { label: 'Não Compareceu', icon: XCircle, className: 'text-destructive bg-destructive/10 border-destructive/40' },
  cancelled: { label: 'Cancelado', icon: Ban, className: 'text-muted-foreground bg-muted border-border' },
};

export default function CalendarPage() {
  const { 
    appointments, 
    isLoading, 
    currentDate,
    todayStats,
    createAppointment, 
    updateStatus,
    deleteAppointment,
    setCurrentDate 
  } = useAppointments();
  
  const { services } = useServices();
  const { customers } = useCustomers();

  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    customer_id: string;
    service_id: string;
    date: string;
    time: string;
    notes: string;
  }>({
    customer_id: '',
    service_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    notes: '',
  });

  const selectedService = useMemo(() => 
    services.find(s => s.id === formData.service_id),
    [services, formData.service_id]
  );

  const formatDateHeader = () => {
    return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = view === 'day' ? 1 : view === 'week' ? 7 : 30;
    const newDate = addDays(currentDate, direction === 'next' ? days : -days);
    setCurrentDate(newDate);
  };

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(apt => {
      const aptTime = format(new Date(apt.scheduled_at), 'HH:mm');
      return aptTime === time;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleOpenDialog = () => {
    setFormData({
      customer_id: '',
      service_id: '',
      date: format(currentDate, 'yyyy-MM-dd'),
      time: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.service_id || !formData.date || !formData.time) return;
    if (!selectedService) return;

    setIsSubmitting(true);
    
    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`);
    
    const data: CreateAppointmentData = {
      customer_id: formData.customer_id,
      service_id: formData.service_id,
      scheduled_at: scheduledAt.toISOString(),
      duration: selectedService.duration,
      price: Number(selectedService.price),
      notes: formData.notes || undefined,
      status: 'pending',
    };

    await createAppointment(data);
    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    await updateStatus(appointmentId, newStatus);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="mt-1 text-muted-foreground">
              {todayStats.total} agendamento{todayStats.total !== 1 ? 's' : ''} • R$ {todayStats.revenue.toFixed(2)} previsto
            </p>
          </div>
          
          <Button 
            className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth"
            onClick={handleOpenDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Calendar Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoje
                </Button>
                <h2 className="text-lg font-semibold ml-2 capitalize">
                  {formatDateHeader()}
                </h2>
              </div>
              
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                {(['day', 'week', 'month'] as const).map((v) => (
                  <Button
                    key={v}
                    variant={view === v ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView(v)}
                    className={cn(
                      view === v && "bg-background shadow-sm"
                    )}
                  >
                    {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Day View */}
            {view === 'day' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    {timeSlots.map((slot) => {
                      const appointment = getAppointmentForSlot(slot);
                      
                      return (
                        <div
                          key={slot}
                          className={cn(
                            "flex items-stretch gap-4 rounded-lg p-3 transition-smooth",
                            appointment ? "bg-card border border-border" : "hover:bg-muted/50"
                          )}
                        >
                          <div className="w-16 flex-shrink-0 text-sm font-medium text-muted-foreground">
                            {slot}
                          </div>
                          
                          {appointment ? (
                            <div 
                              className={cn(
                                "flex-1 rounded-lg border-l-4 p-3",
                                statusConfig[appointment.status].className
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                      {appointment.customer ? getInitials(appointment.customer.name) : '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {appointment.customer?.name || 'Cliente'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.service?.name || 'Serviço'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {appointment.duration} min
                                      </span>
                                      <span>R$ {Number(appointment.price).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline"
                                    className={cn("gap-1", statusConfig[appointment.status].className)}
                                  >
                                    {statusConfig[appointment.status].label}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                        Marcar Concluído
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'no_show')}>
                                        <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                        Não Compareceu
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                        className="text-muted-foreground"
                                      >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancelar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => deleteAppointment(appointment.id)}
                                        className="text-destructive"
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center text-sm text-muted-foreground min-h-[40px] cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  time: slot,
                                  date: format(currentDate, 'yyyy-MM-dd')
                                }));
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Disponível
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Week View */}
            {view === 'week' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => {
                      const date = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), i);
                      const isToday = isSameDay(date, new Date());
                      const dayAppointments = appointments.filter(apt => 
                        isSameDay(new Date(apt.scheduled_at), date)
                      );
                      
                      return (
                        <div key={day} className="text-center">
                          <div className={cn(
                            "rounded-lg p-2 mb-2",
                            isToday && "bg-primary text-primary-foreground"
                          )}>
                            <p className="text-xs font-medium">{day}</p>
                            <p className="text-lg font-bold">{format(date, 'd')}</p>
                          </div>
                          <div className="space-y-1 min-h-[200px]">
                            {dayAppointments.slice(0, 3).map(apt => (
                              <div 
                                key={apt.id}
                                className={cn(
                                  "rounded p-1.5 text-xs cursor-pointer",
                                  statusConfig[apt.status].className
                                )}
                              >
                                <p className="font-medium truncate">
                                  {format(new Date(apt.scheduled_at), 'HH:mm')} - {apt.customer?.name?.split(' ')[0] || 'Cliente'}
                                </p>
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{dayAppointments.length - 3} mais
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Month View */}
            {view === 'month' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {[...Array(35)].map((_, i) => {
                      const date = new Date(currentDate);
                      date.setDate(1);
                      const startDay = date.getDay();
                      date.setDate(i - startDay + 1);
                      
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = isSameDay(date, new Date());
                      const dayAppointments = appointments.filter(apt => 
                        isSameDay(new Date(apt.scheduled_at), date)
                      );
                      
                      return (
                        <div
                          key={i}
                          className={cn(
                            "aspect-square p-1 rounded-lg cursor-pointer transition-smooth hover:bg-accent",
                            !isCurrentMonth && "opacity-30",
                            isToday && "ring-2 ring-primary"
                          )}
                          onClick={() => {
                            setCurrentDate(date);
                            setView('day');
                          }}
                        >
                          <div className={cn(
                            "text-sm font-medium text-center",
                            isToday && "text-primary"
                          )}>
                            {date.getDate()}
                          </div>
                          {dayAppointments.length > 0 && isCurrentMonth && (
                            <div className="flex justify-center gap-0.5 mt-1">
                              {dayAppointments.slice(0, 3).map((_, idx) => (
                                <div key={idx} className="h-1.5 w-1.5 rounded-full bg-primary" />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Create Appointment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Agendamento</DialogTitle>
              <DialogDescription>
                Agende um novo horário para um cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum cliente cadastrado. Cadastre primeiro em Clientes.
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service">Serviço *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.filter(s => s.is_active).map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration}min - R$ {Number(service.price).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedService && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-muted-foreground">
                    Duração: {selectedService.duration} min • Valor: R$ {Number(selectedService.price).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes"
                  placeholder="Observações sobre o agendamento..."
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.customer_id || !formData.service_id || !formData.date || !formData.time}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Agendamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
