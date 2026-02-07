import { 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data for organizations
const organizations = [
  {
    id: 'org-001',
    name: 'Beleza Total Salon',
    slug: 'beleza-total',
    email: 'contato@belezatotal.com',
    status: 'active' as const,
    plan: 'professional',
    mrr: 299,
    bookingsToday: 12,
    createdAt: '2024-01-15',
  },
  {
    id: 'org-002',
    name: 'Fitness Pro Gym',
    slug: 'fitness-pro',
    email: 'admin@fitnesspro.com',
    status: 'active' as const,
    plan: 'enterprise',
    mrr: 599,
    bookingsToday: 34,
    createdAt: '2024-02-20',
  },
  {
    id: 'org-003',
    name: 'Zen Spa & Wellness',
    slug: 'zen-spa',
    email: 'hello@zenspa.com',
    status: 'trial' as const,
    plan: 'starter',
    mrr: 0,
    bookingsToday: 5,
    createdAt: '2024-12-01',
  },
  {
    id: 'org-004',
    name: 'Quick Cuts Barbershop',
    slug: 'quick-cuts',
    email: 'owner@quickcuts.com',
    status: 'active' as const,
    plan: 'starter',
    mrr: 49,
    bookingsToday: 8,
    createdAt: '2024-06-10',
  },
  {
    id: 'org-005',
    name: 'Dental Care Plus',
    slug: 'dental-care',
    email: 'clinic@dentalcare.com',
    status: 'inactive' as const,
    plan: 'professional',
    mrr: 0,
    bookingsToday: 0,
    createdAt: '2023-11-20',
  },
];

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  trial: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-border',
};

export default function SuperAdminDashboard() {
  const totalMRR = organizations.reduce((acc, org) => acc + org.mrr, 0);
  const activeOrgs = organizations.filter(org => org.status === 'active').length;
  const trialOrgs = organizations.filter(org => org.status === 'trial').length;
  const totalBookingsToday = organizations.reduce((acc, org) => acc + org.bookingsToday, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor your SaaS platform performance and manage organizations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Total Companies"
            value={organizations.length}
            change={12}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatCard
            title="Monthly Recurring Revenue"
            value={`R$ ${totalMRR.toLocaleString()}`}
            change={8.5}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Active Trials"
            value={trialOrgs}
            change={25}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Bookings Today"
            value={totalBookingsToday}
            change={15}
            icon={<Calendar className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Organizations Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Organizations</h2>
              <p className="text-sm text-muted-foreground">
                Manage all registered companies
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search organizations..." 
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Add Organization
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="text-right">Bookings Today</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">{org.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize", statusStyles[org.status])}
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{org.plan}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {org.mrr > 0 ? `R$ ${org.mrr}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1">
                        {org.bookingsToday}
                        {org.bookingsToday > 10 && (
                          <TrendingUp className="h-3 w-3 text-success" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Organization</DropdownMenuItem>
                          <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
