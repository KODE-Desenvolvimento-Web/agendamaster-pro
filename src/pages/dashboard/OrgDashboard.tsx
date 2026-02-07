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
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Mock data for today's appointments
const todaysAppointments = [
  {
    id: '1',
    time: '09:00',
    customer: 'Ana Silva',
    service: 'Corte + Escova',
    duration: 90,
    status: 'confirmed' as const,
    price: 150,
  },
  {
    id: '2',
    time: '10:30',
    customer: 'Carlos Mendes',
    service: 'Barba',
    duration: 30,
    status: 'confirmed' as const,
    price: 50,
  },
  {
    id: '3',
    time: '11:00',
    customer: 'Beatriz Oliveira',
    service: 'Manicure + Pedicure',
    duration: 60,
    status: 'pending' as const,
    price: 80,
  },
  {
    id: '4',
    time: '14:00',
    customer: 'Roberto Santos',
    service: 'Corte Masculino',
    duration: 45,
    status: 'confirmed' as const,
    price: 60,
  },
  {
    id: '5',
    time: '15:00',
    customer: 'Juliana Costa',
    service: 'Coloração',
    duration: 120,
    status: 'no_show' as const,
    price: 280,
  },
];

// Mock data for top customers
const topCustomers = [
  { id: '1', name: 'Maria Fernanda', visits: 24, spent: 3600, avatar: undefined },
  { id: '2', name: 'João Pedro', visits: 18, spent: 1440, avatar: undefined },
  { id: '3', name: 'Carolina Lima', visits: 15, spent: 2250, avatar: undefined },
  { id: '4', name: 'Lucas Almeida', visits: 12, spent: 960, avatar: undefined },
];

const statusConfig = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, className: 'text-success bg-success/10' },
  pending: { label: 'Pending', icon: Clock, className: 'text-warning bg-warning/10' },
  no_show: { label: 'No Show', icon: XCircle, className: 'text-destructive bg-destructive/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-muted-foreground bg-muted' },
};

export default function OrgDashboard() {
  const confirmedAppointments = todaysAppointments.filter(a => a.status === 'confirmed').length;
  const pendingAppointments = todaysAppointments.filter(a => a.status === 'pending').length;
  const todayRevenue = todaysAppointments
    .filter(a => a.status === 'confirmed')
    .reduce((acc, a) => acc + a.price, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Link>
            </Button>
            <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth" asChild>
              <Link to="/calendar">
                New Booking
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Today's Appointments"
            value={todaysAppointments.length}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            title="Confirmed"
            value={confirmedAppointments}
            icon={<CheckCircle2 className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Pending Confirmation"
            value={pendingAppointments}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Today's Revenue"
            value={`R$ ${todayRevenue}`}
            change={12}
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
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/calendar">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysAppointments.map((appointment) => {
                  const status = statusConfig[appointment.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={appointment.id}
                      className={cn(
                        "flex items-center gap-4 rounded-lg border border-border p-4 transition-smooth hover:bg-accent/50",
                        appointment.status === 'no_show' && "opacity-60"
                      )}
                    >
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold">{appointment.time}</p>
                        <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                      </div>
                      
                      <div className="h-12 w-px bg-border" />
                      
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {appointment.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{appointment.customer}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {appointment.service}
                        </p>
                      </div>
                      
                      <div className="text-right hidden sm:block">
                        <p className="font-medium">R$ {appointment.price}</p>
                      </div>
                      
                      <Badge 
                        variant="secondary"
                        className={cn("gap-1 shrink-0", status.className)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">{status.label}</span>
                      </Badge>
                      
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top Customers
              </CardTitle>
              <CardDescription>This month's most active customers</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.visits} visits
                      </p>
                    </div>
                    <p className="text-sm font-medium text-success">
                      R$ {customer.spent.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/customers">
                  View All Customers
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
                  <span>Manage Services</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/customers">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Customer CRM</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/reports">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>View Reports</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/settings/notifications">
                  <UserX className="h-5 w-5 text-destructive" />
                  <span>No-Show Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
