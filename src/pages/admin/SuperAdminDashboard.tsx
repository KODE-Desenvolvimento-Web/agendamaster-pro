import { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Filter,
  Loader2
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
import { CreateOrganizationDialog } from '@/components/admin/CreateOrganizationDialog';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  status: 'active' | 'trial' | 'inactive';
  plan: string;
  created_at: string;
}

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrganizations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrganizations(data as Organization[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = organizations.reduce((acc, org) => acc + (planPrices[org.plan] || 0), 0);
  const activeOrgs = organizations.filter(org => org.status === 'active').length;
  const trialOrgs = organizations.filter(org => org.status === 'trial').length;

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
              onUserCreated={fetchOrganizations}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Total de Empresas"
            value={organizations.length}
            change={12}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatCard
            title="Receita Mensal Recorrente"
            value={`R$ ${totalMRR.toLocaleString()}`}
            change={8.5}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Trials Ativos"
            value={trialOrgs}
            change={25}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Empresas Ativas"
            value={activeOrgs}
            change={15}
            icon={<Calendar className="h-6 w-6" />}
            variant="success"
          />
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
              <CreateOrganizationDialog onOrganizationCreated={fetchOrganizations} />
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
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="text-right">Criado em</TableHead>
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
                            <p className="text-sm text-muted-foreground">{org.email || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize", statusStyles[org.status])}
                        >
                          {org.status === 'active' ? 'Ativo' : org.status === 'trial' ? 'Trial' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{org.plan}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {planPrices[org.plan] > 0 ? `R$ ${planPrices[org.plan]}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString('pt-BR')}
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
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>Editar Organização</DropdownMenuItem>
                            <DropdownMenuItem>Gerenciar Assinatura</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
