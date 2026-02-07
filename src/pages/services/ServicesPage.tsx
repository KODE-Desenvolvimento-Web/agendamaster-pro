import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Copy,
  Loader2,
  Power
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useServices, Service, CreateServiceData } from '@/hooks/useServices';
import { EmptyState } from '@/components/ui/EmptyState';

const defaultColors = [
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Vermelho', value: '#ef4444' },
];

export default function ServicesPage() {
  const { 
    services, 
    categories, 
    isLoading, 
    createService, 
    updateService, 
    deleteService, 
    toggleServiceStatus,
    createCategory 
  } = useServices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category_id: undefined,
    is_active: true,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#8b5cf6',
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || service.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#6b7280';
    return categories.find(c => c.id === categoryId)?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria';
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: Number(service.price),
        category_id: service.category_id || undefined,
        is_active: service.is_active,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        category_id: undefined,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.duration <= 0) return;

    setIsSubmitting(true);
    
    if (editingService) {
      await updateService(editingService.id, formData);
    } else {
      await createService(formData);
    }

    setIsSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleCreateCategory = async () => {
    if (!categoryFormData.name) return;

    setIsSubmitting(true);
    await createCategory(categoryFormData);
    setIsSubmitting(false);
    setIsCategoryDialogOpen(false);
    setCategoryFormData({ name: '', color: '#8b5cf6' });
  };

  const handleDelete = async () => {
    if (!deletingServiceId) return;

    setIsSubmitting(true);
    await deleteService(deletingServiceId);
    setIsSubmitting(false);
    setIsDeleteDialogOpen(false);
    setDeletingServiceId(null);
  };

  const handleDuplicate = async (service: Service) => {
    await createService({
      name: `${service.name} (cópia)`,
      description: service.description || '',
      duration: service.duration,
      price: Number(service.price),
      category_id: service.category_id || undefined,
      is_active: true,
    });
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
          
          <div className="flex gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Crie uma categoria para organizar seus serviços.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cat-name">Nome da Categoria</Label>
                    <Input 
                      id="cat-name" 
                      placeholder="ex.: Cabelo"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cor</Label>
                    <div className="flex flex-wrap gap-2">
                      {defaultColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={cn(
                            "h-8 w-8 rounded-full transition-all",
                            categoryFormData.color === color.value && "ring-2 ring-offset-2 ring-primary"
                          )}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setCategoryFormData(prev => ({ ...prev, color: color.value }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-gradient-primary" 
                    onClick={handleCreateCategory}
                    disabled={isSubmitting || !categoryFormData.name}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Categoria
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Serviço
            </Button>
          </div>
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
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title={searchQuery || selectedCategory ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
            description={searchQuery || selectedCategory 
              ? "Tente ajustar sua busca ou filtros" 
              : "Comece criando seu primeiro serviço"
            }
            action={!searchQuery && !selectedCategory ? (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Serviço
              </Button>
            ) : undefined}
          />
        ) : (
          /* Services Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className={cn(
                  "group relative transition-smooth hover:shadow-lg",
                  !service.is_active && "opacity-60"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(service.category_id) }}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(service.category_id)}
                      </Badge>
                      {!service.is_active && (
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(service)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(service)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleServiceStatus(service.id, !service.is_active)}>
                          <Power className="mr-2 h-4 w-4" />
                          {service.is_active ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setDeletingServiceId(service.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description || 'Sem descrição'}
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
                      <span>R$ {Number(service.price).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
              <DialogDescription>
                {editingService 
                  ? 'Atualize as informações do serviço.'
                  : 'Crie um novo serviço para seus clientes agendarem.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input 
                  id="name" 
                  placeholder="ex.: Corte + Escova"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o que está incluído neste serviço..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    min={5}
                    step={5}
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min={0}
                    step={0.01}
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category_id || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    category_id: value === 'none' ? undefined : value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O serviço será permanentemente removido.
                Se houver agendamentos associados, a exclusão será bloqueada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
