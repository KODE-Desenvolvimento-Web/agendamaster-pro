import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Copy,
  GripVertical
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Mock data
const categories = [
  { id: 'hair', name: 'Cabelo', color: 'bg-purple-500' },
  { id: 'nails', name: 'Unhas', color: 'bg-pink-500' },
  { id: 'beard', name: 'Barba', color: 'bg-blue-500' },
  { id: 'spa', name: 'Spa & Bem-estar', color: 'bg-green-500' },
];

const services = [
  {
    id: '1',
    name: 'Corte + Escova',
    description: 'Corte completo com lavagem e escova profissional',
    duration: 90,
    price: 150,
    category: 'hair',
    isActive: true,
  },
  {
    id: '2',
    name: 'Corte Masculino',
    description: 'Corte tradicional masculino com acabamento',
    duration: 45,
    price: 60,
    category: 'hair',
    isActive: true,
  },
  {
    id: '3',
    name: 'Barba',
    description: 'Modelagem e aparagem profissional de barba',
    duration: 30,
    price: 50,
    category: 'beard',
    isActive: true,
  },
  {
    id: '4',
    name: 'Manicure + Pedicure',
    description: 'Cuidado completo para mãos e pés',
    duration: 60,
    price: 80,
    category: 'nails',
    isActive: true,
  },
  {
    id: '5',
    name: 'Coloração',
    description: 'Coloração completa com produtos premium',
    duration: 120,
    price: 280,
    category: 'hair',
    isActive: true,
  },
  {
    id: '6',
    name: 'Massagem Relaxante',
    description: 'Massagem corporal relaxante de 60 minutos',
    duration: 60,
    price: 180,
    category: 'spa',
    isActive: false,
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || 'bg-gray-500';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie seu catálogo de serviços e preços
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Crie um novo serviço para seus clientes agendarem.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input id="name" placeholder="ex.: Corte + Escova" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva o que está incluído neste serviço..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input id="duration" type="number" placeholder="60" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" placeholder="100" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-smooth"
                      >
                        <div className={cn("h-2 w-2 rounded-full mr-1.5", category.color)} />
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-gradient-primary" onClick={() => setIsDialogOpen(false)}>
                  Criar Serviço
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar serviços..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-1.5"
                  >
                    <div className={cn("h-2 w-2 rounded-full", category.color)} />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card 
              key={service.id} 
              className={cn(
                "group relative transition-smooth hover:shadow-lg",
                !service.isActive && "opacity-60"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      getCategoryColor(service.category)
                    )} />
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryName(service.category)}
                    </Badge>
                    {!service.isActive && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>R$ {service.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum serviço encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar sua busca ou filtros
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
