import { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Search,
  Filter,
  Loader2,
  TrendingUp,
  AlertTriangle
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
import { CreateOrganizationDialog } from '@/components/admin/CreateOrganizationDialog';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { OrganizationActions } from '@/components/admin/OrganizationActions';
import { useSuperAdminStats } from '@/hooks/useSuperAdminStats';
import { cn } from '@/lib/utils';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  trial: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-muted text-muted-foreground border-border',
};

const planPrices: Record<string, number> = {
  free: 0,
  starter: 49,
  professional: 299,
  enterprise: 599,
};

export default function SuperAdminDashboard() {
  const { 
    stats, 
    organizations, 
    isLoading, 
    refetch,
    updateOrganizationStatus,
    updateOrganizationPlan 
  } = useSuperAdminStats();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check for trials expiring soon (next 3 days)
  const expiringTrials = organizations.filter(org => {
    if (org.status !== 'trial' || !org.trial_ends_at) return false;
    const trialEnd = new Date(org.trial_ends_at);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return trialEnd <= threeDaysFromNow && trialEnd >= now;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Super Admin</h1>
            <p className="mt-1 text-muted-foreground">
              Monitore o desempenho da plataforma SaaS e gerencie as organizações.
            </p>
          </div>
          <div className="flex gap-2">
            <CreateUserDialog 
              organizations={organizations.map(o => ({ id: o.id, name: o.name }))}
              onUserCreated={refetch}
            />
          </div>
        </div>

        {/* Expiring Trials Alert */}
        {expiringTrials.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-medium text-warning">
                {expiringTrials.length} {expiringTrials.length === 1 ? 'trial expira' : 'trials expiram'} nos próximos 3 dias
              </p>
              <p className="text-sm text-warning/80">
                {expiringTrials.map(t => t.name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Total de Empresas"
            value={stats.totalOrganizations}
            change={12}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatCard
            title="Receita Mensal (MRR)"
            value={`R$ ${stats.monthlyRevenue.toLocaleString()}`}
            change={8.5}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Trials Ativos"
            value={stats.trialOrganizations}
            change={25}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Taxa de Conversão"
            value={`${stats.trialConversionRate}%`}
            change={5}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Empresas Ativas</p>
            <p className="text-3xl font-bold mt-1">{stats.activeOrganizations}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
            <p className="text-3xl font-bold mt-1">{stats.totalAppointments.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-3xl font-bold mt-1">{stats.totalCustomers.toLocaleString()}</p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Organizações</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie todas as empresas cadastradas
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar organizações..." 
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
              <CreateOrganizationDialog onOrganizationCreated={refetch} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma organização encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? 'Tente uma busca diferente' : 'Comece criando a primeira organização'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Organização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Agendamentos</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{org.email || org.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className={cn("capitalize w-fit", statusStyles[org.status])}
                          >
                            {org.status === 'active' ? 'Ativo' : org.status === 'trial' ? 'Trial' : 'Inativo'}
                          </Badge>
                          {org.status === 'trial' && org.trial_ends_at && (
                            <span className="text-xs text-muted-foreground">
                              Expira em {new Date(org.trial_ends_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{org.plan}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {org.customersCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {org.appointmentsCount}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {planPrices[org.plan] > 0 ? `R$ ${planPrices[org.plan]}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <OrganizationActions
                          organization={org}
                          onStatusChange={updateOrganizationStatus}
                          onPlanChange={updateOrganizationPlan}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
