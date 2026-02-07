import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Check, 
  ChevronLeft, 
  ArrowRight,
  MapPin,
  Phone,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfDay, isSameDay, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  status: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category?: { name: string; color: string } | null;
}

interface BookingHours {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BookingHours[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<{ scheduled_at: string; duration: number }[]>([]);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  const selectedServiceData = useMemo(() => 
    services.find(s => s.id === selectedService),
    [services, selectedService]
  );

  // Fetch organization data
  useEffect(() => {
    async function fetchData() {
      if (!slug) return;

      setIsLoading(true);

      // Fetch organization by slug
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();

      if (orgError || !orgData) {
        // Try to find trial orgs too
        const { data: trialOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'trial')
          .maybeSingle();

        if (!trialOrg) {
          setIsLoading(false);
          return;
        }
        setOrganization(trialOrg);
      } else {
        setOrganization(orgData);
      }

      const orgId = orgData?.id || (await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()).data?.id;

      if (!orgId) {
        setIsLoading(false);
        return;
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select(`
          id, name, description, duration, price,
          category:service_categories(name, color)
        `)
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name');

      setServices(servicesData || []);

      // Fetch business hours
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*')
        .eq('organization_id', orgId);

      setBusinessHours(hoursData || []);

      setIsLoading(false);
    }

    fetchData();
  }, [slug]);

  // Fetch existing appointments when date changes
  useEffect(() => {
    async function fetchAppointments() {
      if (!organization?.id || !selectedDate) return;

      const startOfSelectedDay = startOfDay(selectedDate);
      const endOfSelectedDay = addDays(startOfSelectedDay, 1);

      const { data } = await supabase
        .from('appointments')
        .select('scheduled_at, duration')
        .eq('organization_id', organization.id)
        .gte('scheduled_at', startOfSelectedDay.toISOString())
        .lt('scheduled_at', endOfSelectedDay.toISOString())
        .in('status', ['pending', 'confirmed']);

      setExistingAppointments(data || []);
    }

    fetchAppointments();
  }, [organization?.id, selectedDate]);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      dates.push(date);
    }
    return dates;
  };

  const getAvailableSlots = useMemo(() => {
    if (!selectedDate || !selectedServiceData) return [];

    const dayOfWeek = selectedDate.getDay();
    const hours = businessHours.find(h => h.day_of_week === dayOfWeek);

    // Default hours if not configured
    const opensAt = hours?.opens_at || '09:00';
    const closesAt = hours?.closes_at || '18:00';
    const isClosed = hours?.is_closed ?? (dayOfWeek === 0); // Sunday closed by default

    if (isClosed) return [];

    const serviceDuration = selectedServiceData.duration;
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);

    return timeSlots.filter(slot => {
      // Check if slot is within business hours
      if (slot < opensAt || slot >= closesAt) return false;

      // Check if slot end time is within business hours
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotEndMinutes = slotHour * 60 + slotMinute + serviceDuration;
      const [closeHour, closeMinute] = closesAt.split(':').map(Number);
      const closeMinutes = closeHour * 60 + closeMinute;
      if (slotEndMinutes > closeMinutes) return false;

      // If today, check if slot is in the future
      if (isToday) {
        const slotTime = setMinutes(setHours(selectedDate, slotHour), slotMinute);
        if (slotTime <= now) return false;
      }

      // Check for conflicts with existing appointments
      const slotStart = setMinutes(setHours(selectedDate, slotHour), slotMinute);
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

      const hasConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.scheduled_at);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      return !hasConflict;
    });
  }, [selectedDate, selectedServiceData, businessHours, existingAppointments]);

  const handleConfirm = async () => {
    if (!organization?.id || !selectedServiceData || !selectedDate || !selectedTime) return;
    if (!customerInfo.name || !customerInfo.phone) return;

    setIsSubmitting(true);

    try {
      // First, check booking availability using edge function
      const [hour, minute] = selectedTime.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hour), minute);

      const availabilityCheck = await supabase.functions.invoke('check-booking', {
        body: {
          organization_id: organization.id,
          staff_id: null, // Public booking doesn't select staff
          scheduled_at: scheduledAt.toISOString(),
          duration: selectedServiceData.duration,
        },
      });

      if (availabilityCheck.error) {
        throw new Error('Erro ao verificar disponibilidade');
      }

      if (!availabilityCheck.data.available) {
        toast({
          title: 'Horário indisponível',
          description: availabilityCheck.data.message || 'Este horário não está mais disponível.',
          variant: 'destructive',
        });
        // Refresh appointments to update available slots
        const startOfSelectedDay = startOfDay(selectedDate);
        const endOfSelectedDay = addDays(startOfSelectedDay, 1);
        const { data } = await supabase
          .from('appointments')
          .select('scheduled_at, duration')
          .eq('organization_id', organization.id)
          .gte('scheduled_at', startOfSelectedDay.toISOString())
          .lt('scheduled_at', endOfSelectedDay.toISOString())
          .in('status', ['pending', 'confirmed']);
        setExistingAppointments(data || []);
        setIsSubmitting(false);
        return;
      }

      // Create or find customer
      let customerId: string;

      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('phone', customerInfo.phone)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        
        // Update customer info
        await supabase
          .from('customers')
          .update({
            name: customerInfo.name,
            email: customerInfo.email || null,
          })
          .eq('id', customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            organization_id: organization.id,
            name: customerInfo.name,
            email: customerInfo.email || null,
            phone: customerInfo.phone,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          throw new Error('Erro ao criar cliente');
        }

        customerId = newCustomer.id;
      }

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          organization_id: organization.id,
          customer_id: customerId,
          service_id: selectedServiceData.id,
          scheduled_at: scheduledAt.toISOString(),
          duration: selectedServiceData.duration,
          price: selectedServiceData.price,
          status: 'pending',
        });

      if (appointmentError) {
        throw new Error('Erro ao criar agendamento');
      }

      toast({
        title: 'Agendamento Confirmado!',
        description: 'Você receberá uma confirmação em breve.',
      });

      // Reset form
      setStep(1);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setCustomerInfo({ name: '', email: '', phone: '' });

    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground text-center">
          A empresa que você está procurando não existe ou não está disponível para agendamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {organization.logo_url ? (
                <img 
                  src={organization.logo_url} 
                  alt={organization.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                  style={{ backgroundColor: organization.primary_color || '#0070F3' }}
                >
                  {organization.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-semibold">{organization.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span>Aberto para agendamentos</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              {organization.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span>{organization.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-smooth",
                    step >= s 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={cn(
                  "text-sm font-medium hidden sm:inline",
                  step >= s ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s === 1 ? 'Escolher Serviço' : s === 2 ? 'Data e Hora' : 'Confirmar'}
                </span>
                {s < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Escolha um Serviço</CardTitle>
                <CardDescription>Selecione o serviço que deseja agendar</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum serviço disponível no momento.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-lg border transition-smooth text-left",
                          selectedService === service.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{service.name}</p>
                            {service.category && (
                              <Badge variant="secondary" className="text-xs">
                                {service.category.name}
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            R$ {Number(service.price).toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <Button
                  className="w-full mt-6 bg-gradient-primary shadow-glow"
                  size="lg"
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Escolha Data e Horário</CardTitle>
                    <CardDescription>
                      {selectedServiceData?.name} - {selectedServiceData?.duration} min
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Date Selection */}
                <div className="mb-6">
                  <Label className="mb-3 block">Selecione a Data</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generateDates().map((date) => {
                      const isSelected = selectedDate && isSameDay(selectedDate, date);
                      const isToday = isSameDay(date, new Date());
                      
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={cn(
                            "flex flex-col items-center p-3 rounded-lg border min-w-[70px] transition-smooth",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="text-xs font-medium capitalize">
                            {format(date, 'EEE', { locale: ptBR })}
                          </span>
                          <span className="text-lg font-bold">{format(date, 'd')}</span>
                          <span className="text-xs">
                            {format(date, 'MMM', { locale: ptBR })}
                          </span>
                          {isToday && !isSelected && (
                            <Badge variant="secondary" className="text-[10px] mt-1 px-1">
                              Hoje
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="animate-fade-in">
                    <Label className="mb-3 block">Selecione o Horário</Label>
                    {getAvailableSlots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum horário disponível nesta data.</p>
                        <p className="text-sm">Tente selecionar outra data.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {timeSlots.map((time) => {
                          const isAvailable = getAvailableSlots.includes(time);
                          const isSelected = selectedTime === time;
                          
                          return (
                            <button
                              key={time}
                              disabled={!isAvailable}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "p-3 rounded-lg border text-sm font-medium transition-smooth",
                                !isAvailable && "opacity-40 cursor-not-allowed bg-muted",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : isAvailable && "border-border hover:border-primary/50"
                              )}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                <Button
                  className="w-full mt-6 bg-gradient-primary shadow-glow"
                  size="lg"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Confirme seu Agendamento</CardTitle>
                    <CardDescription>Preencha seus dados para finalizar</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Booking Summary */}
                <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6">
                  <h3 className="font-medium mb-3">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviço</span>
                      <span className="font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data</span>
                      <span className="font-medium capitalize">
                        {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-medium">{selectedServiceData?.duration} min</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary text-lg">
                        R$ {selectedServiceData && Number(selectedServiceData.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info Form */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button
                  className="w-full mt-6 bg-gradient-primary shadow-glow"
                  size="lg"
                  disabled={isSubmitting || !customerInfo.name || !customerInfo.phone}
                  onClick={handleConfirm}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Agendamento
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Você receberá uma confirmação em breve.
                  Nenhum pagamento necessário no momento.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 {organization.name}. Desenvolvido por AgendaMaster Pro.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-smooth">Termos</a>
              <a href="#" className="hover:text-foreground transition-smooth">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
