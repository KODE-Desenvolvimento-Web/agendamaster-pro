import { useState } from 'react';
import { 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  FileText,
  Loader2,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/StatCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useReportsData } from '@/hooks/useReportsData';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ReportsPage() {
  const [period, setPeriod] = useState(30);
  const { stats, monthlyRevenue, topServices, topCustomers, isLoading } = useReportsData(period);

  const maxRevenue = Math.max(...monthlyRevenue.map(d => d.revenue), 1);

  // Calculate percentage changes (mock for now - would need previous period data)
  const revenueChange = 12.5;
  const appointmentsChange = 8.2;
  const customersChange = 15.3;
  const ticketChange = stats.averageTicket > 0 ? 5.1 : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="mt-1 text-muted-foreground">
              Analise o desempenho do seu negócio
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={revenueChange}
            icon={<DollarSign className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Total de Agendamentos"
            value={stats.totalAppointments.toString()}
            change={appointmentsChange}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            title="Novos Clientes"
            value={stats.newCustomers.toString()}
            change={customersChange}
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Ticket Médio"
            value={`R$ ${stats.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={ticketChange}
            icon={<TrendingUp className="h-6 w-6" />}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-3xl font-bold mt-1 text-success">
                    {stats.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de No-Show</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">
                    {stats.noShowRate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Visão Geral de Receita
                  </CardTitle>
                  <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.every(m => m.revenue === 0) ? (
                <EmptyState
                  icon={<BarChart3 className="h-12 w-12" />}
                  title="Sem dados de receita"
                  description="Agendamentos concluídos aparecerão aqui"
                />
              ) : (
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {monthlyRevenue.map((data) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80"
                        style={{ 
                          height: `${(data.revenue / maxRevenue) * 250}px`,
                          minHeight: data.revenue > 0 ? '20px' : '4px'
                        }}
                      />
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground capitalize">{data.month}</p>
                        <p className="text-sm font-bold">
                          {data.revenue > 0 ? `R$ ${(data.revenue / 1000).toFixed(1)}k` : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Top Serviços
              </CardTitle>
              <CardDescription>Serviços mais realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {topServices.length === 0 ? (
                <EmptyState
                  icon={<PieChart className="h-12 w-12" />}
                  title="Sem dados"
                  description="Complete agendamentos para ver estatísticas"
                />
              ) : (
                <div className="space-y-4">
                  {topServices.map((service, index) => {
                    const percentage = stats.totalRevenue > 0 
                      ? (service.revenue / stats.totalRevenue) * 100 
                      : 0;
                    return (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-3 w-3 rounded-full",
                              index === 0 ? "bg-primary" : 
                              index === 1 ? "bg-blue-500" : 
                              index === 2 ? "bg-green-500" : 
                              index === 3 ? "bg-yellow-500" : "bg-purple-500"
                            )} />
                            <span className="truncate max-w-[120px]">{service.name}</span>
                          </div>
                          <span className="font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              index === 0 ? "bg-primary" : 
                              index === 1 ? "bg-blue-500" : 
                              index === 2 ? "bg-green-500" : 
                              index === 3 ? "bg-yellow-500" : "bg-purple-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Clientes</CardTitle>
            <CardDescription>Clientes por valor total gasto</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="Sem dados de clientes"
                description="Clientes com agendamentos concluídos aparecerão aqui"
              />
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div 
                    key={customer.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      index === 0 && "bg-yellow-500/20 text-yellow-600",
                      index === 1 && "bg-gray-400/20 text-gray-500",
                      index === 2 && "bg-amber-600/20 text-amber-700",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.totalVisits} visitas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">
                        R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {customer.lastVisit && (
                        <p className="text-xs text-muted-foreground">
                          Última visita: {new Date(customer.lastVisit).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
