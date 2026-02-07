import { useState } from 'react';
import { 
  Plus, 
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Star,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mock data
const customers = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '+55 11 99999-1234',
    totalVisits: 24,
    totalSpent: 3600,
    lastVisit: '2024-12-20',
    noShows: 0,
    isVIP: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos.m@email.com',
    phone: '+55 11 98888-5678',
    totalVisits: 12,
    totalSpent: 960,
    lastVisit: '2024-12-18',
    noShows: 1,
    isVIP: false,
    createdAt: '2024-03-20',
  },
  {
    id: '3',
    name: 'Beatriz Oliveira',
    email: 'bia.oliveira@email.com',
    phone: '+55 11 97777-9012',
    totalVisits: 8,
    totalSpent: 640,
    lastVisit: '2024-12-15',
    noShows: 0,
    isVIP: false,
    createdAt: '2024-06-10',
  },
  {
    id: '4',
    name: 'Roberto Santos',
    email: 'roberto.s@email.com',
    phone: '+55 11 96666-3456',
    totalVisits: 3,
    totalSpent: 180,
    lastVisit: '2024-12-10',
    noShows: 2,
    isVIP: false,
    createdAt: '2024-10-05',
  },
  {
    id: '5',
    name: 'Juliana Costa',
    email: 'ju.costa@email.com',
    phone: '+55 11 95555-7890',
    totalVisits: 15,
    totalSpent: 2250,
    lastVisit: '2024-12-22',
    noShows: 0,
    isVIP: true,
    createdAt: '2024-02-28',
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie sua base de clientes e histórico
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Adicione um novo cliente ao seu banco de dados.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="ex.: Maria Santos" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" placeholder="+55 11 99999-9999" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Adicionar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Clientes</CardDescription>
              <CardTitle className="text-3xl">{customers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Clientes VIP</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {customers.filter(c => c.isVIP).length}
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taxa de No-Show</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {Math.round((customers.filter(c => c.noShows > 0).length / customers.length) * 100)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Base de Clientes</CardTitle>
                <CardDescription>
                  Lista de todos os seus clientes cadastrados
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar clientes..." 
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-center">Visitas</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{customer.name}</p>
                              {customer.isVIP && (
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Desde {formatDate(customer.createdAt)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{customer.totalVisits}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-success">
                        R$ {customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(customer.lastVisit)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.noShows > 0 ? (
                          <Badge 
                            variant="outline" 
                            className="gap-1 bg-destructive/10 text-destructive border-destructive/20"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {customer.noShows} Falta{customer.noShows > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="bg-success/10 text-success border-success/20"
                          >
                            Regular
                          </Badge>
                        )}
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
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Agendar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Editar Cliente</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
