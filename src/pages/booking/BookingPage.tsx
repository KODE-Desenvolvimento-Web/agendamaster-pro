import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Phone,
  Star,
  ArrowRight
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

// Mock organization data
const organization = {
  name: 'Beleza Total Salon',
  slug: 'beleza-total',
  description: 'Premium hair and beauty services in the heart of São Paulo.',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  phone: '+55 11 3000-0000',
  rating: 4.9,
  reviewCount: 234,
  logo: undefined,
  primaryColor: '#0070F3',
};

const services = [
  { id: '1', name: 'Haircut + Blowdry', duration: 90, price: 150, category: 'Hair' },
  { id: '2', name: 'Men\'s Haircut', duration: 45, price: 60, category: 'Hair' },
  { id: '3', name: 'Beard Trim', duration: 30, price: 50, category: 'Beard' },
  { id: '4', name: 'Manicure + Pedicure', duration: 60, price: 80, category: 'Nails' },
  { id: '5', name: 'Hair Coloring', duration: 120, price: 280, category: 'Hair' },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const availableSlots = ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00', '17:00'];

export default function BookingPage() {
  const { slug } = useParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  const selectedServiceData = services.find(s => s.id === selectedService);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleConfirm = () => {
    // In production, this would submit to the backend
    alert('Booking confirmed! You will receive a confirmation email shortly.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-bold">
                {organization.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-semibold">{organization.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span>{organization.rating}</span>
                  <span>({organization.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{organization.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{organization.phone}</span>
              </div>
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
                  {s === 1 ? 'Select Service' : s === 2 ? 'Choose Time' : 'Confirm'}
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
                <CardTitle>Select a Service</CardTitle>
                <CardDescription>Choose the service you'd like to book</CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Badge variant="secondary" className="text-xs">
                            {service.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          R$ {service.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <Button
                  className="w-full mt-6 bg-gradient-primary shadow-glow"
                  size="lg"
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                >
                  Continue
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
                    <CardTitle>Select Date & Time</CardTitle>
                    <CardDescription>
                      {selectedServiceData?.name} - {selectedServiceData?.duration} min
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Date Selection */}
                <div className="mb-6">
                  <Label className="mb-3 block">Select Date</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generateDates().map((date) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();
                      
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
                          <span className="text-xs font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-bold">{date.getDate()}</span>
                          <span className="text-xs">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          {isToday && !isSelected && (
                            <Badge variant="secondary" className="text-[10px] mt-1 px-1">
                              Today
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
                    <Label className="mb-3 block">Select Time</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const isAvailable = availableSlots.includes(time);
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
                  </div>
                )}
                
                <Button
                  className="w-full mt-6 bg-gradient-primary shadow-glow"
                  size="lg"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continue
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
                    <CardTitle>Confirm Your Booking</CardTitle>
                    <CardDescription>Enter your details to complete the booking</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Booking Summary */}
                <div className="rounded-lg border border-border bg-muted/30 p-4 mb-6">
                  <h3 className="font-medium mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{selectedServiceData?.duration} min</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary text-lg">
                        R$ {selectedServiceData?.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info Form */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (WhatsApp)</Label>
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
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
                  onClick={handleConfirm}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Booking
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  You will receive a confirmation via email and WhatsApp.
                  No payment required at this time.
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
            <p>© 2024 {organization.name}. Powered by AgendaMaster Pro.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-smooth">Terms</a>
              <a href="#" className="hover:text-foreground transition-smooth">Privacy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
