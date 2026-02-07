import { useState } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const appointments = [
  { id: '1', time: '09:00', duration: 90, customer: 'Ana Silva', service: 'Corte + Escova', status: 'confirmed' },
  { id: '2', time: '10:30', duration: 30, customer: 'Carlos Mendes', service: 'Barba', status: 'confirmed' },
  { id: '3', time: '11:00', duration: 60, customer: 'Beatriz Oliveira', service: 'Manicure', status: 'pending' },
  { id: '4', time: '14:00', duration: 45, customer: 'Roberto Santos', service: 'Corte Masculino', status: 'confirmed' },
  { id: '5', time: '15:30', duration: 120, customer: 'Juliana Costa', service: 'Coloração', status: 'confirmed' },
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDateHeader = () => {
    return currentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(apt => apt.time === time);
  };

  const statusColors = {
    confirmed: 'bg-success/20 border-success/40 text-success',
    pending: 'bg-warning/20 border-warning/40 text-warning',
    cancelled: 'bg-destructive/20 border-destructive/40 text-destructive',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie agendamentos e horários
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Agendamento</DialogTitle>
                <DialogDescription>
                  Agende um novo horário para um cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Ana Silva</SelectItem>
                      <SelectItem value="carlos">Carlos Mendes</SelectItem>
                      <SelectItem value="beatriz">Beatriz Oliveira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Serviço</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircut">Corte + Escova (90min)</SelectItem>
                      <SelectItem value="beard">Barba (30min)</SelectItem>
                      <SelectItem value="manicure">Manicure + Pedicure (60min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Horário</Label>
                    <Select>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Criar Agendamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                            statusColors[appointment.status as keyof typeof statusColors]
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{appointment.customer}</p>
                              <p className="text-sm text-muted-foreground">{appointment.service}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {appointment.duration} min
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center text-sm text-muted-foreground min-h-[40px]">
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

        {/* Week View Placeholder */}
        {view === 'week' && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                  const date = new Date(currentDate);
                  date.setDate(date.getDate() - date.getDay() + i);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={day} className="text-center">
                      <div className={cn(
                        "rounded-lg p-2 mb-2",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        <p className="text-xs font-medium">{day}</p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </div>
                      <div className="space-y-1 min-h-[200px]">
                        {i === 1 && (
                          <div className="rounded bg-success/20 p-1.5 text-xs">
                            <p className="font-medium truncate">09:00 - Ana</p>
                          </div>
                        )}
                        {i === 3 && (
                          <>
                            <div className="rounded bg-success/20 p-1.5 text-xs">
                              <p className="font-medium truncate">10:00 - Carlos</p>
                            </div>
                            <div className="rounded bg-warning/20 p-1.5 text-xs">
                              <p className="font-medium truncate">14:00 - Maria</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month View Placeholder */}
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
                  date.setDate(date.getDate() - date.getDay() + i);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const hasAppointments = [3, 7, 12, 15, 20, 25].includes(i);
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square p-1 rounded-lg cursor-pointer transition-smooth hover:bg-accent",
                        !isCurrentMonth && "opacity-30",
                        isToday && "ring-2 ring-primary"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium text-center",
                        isToday && "text-primary"
                      )}>
                        {date.getDate()}
                      </div>
                      {hasAppointments && isCurrentMonth && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
