import { useState } from 'react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  ArrowUpRight,
  UserCog,
  Ban,
  CheckCircle,
  CreditCard,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationActionsProps {
  organization: {
    id: string;
    name: string;
    status: 'active' | 'trial' | 'inactive';
    plan: string;
  };
  onStatusChange: (orgId: string, status: 'active' | 'trial' | 'inactive') => Promise<boolean>;
  onPlanChange: (orgId: string, plan: string) => Promise<boolean>;
}

export function OrganizationActions({
  organization,
  onStatusChange,
  onPlanChange,
}: OrganizationActionsProps) {
  const { toast } = useToast();
  const { refetchUser } = useAuth();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(organization.plan);

  const handleSuspend = async () => {
    setIsLoading(true);
    const newStatus = organization.status === 'inactive' ? 'active' : 'inactive';
    const success = await onStatusChange(organization.id, newStatus);
    
    if (success) {
      toast({
        title: 'Sucesso',
        description: newStatus === 'inactive' 
          ? 'Organização suspensa com sucesso' 
          : 'Organização reativada com sucesso',
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
    setShowSuspendDialog(false);
  };

  const handlePlanChange = async () => {
    setIsLoading(true);
    const success = await onPlanChange(organization.id, selectedPlan);
    
    if (success) {
      toast({
        title: 'Sucesso',
        description: 'Plano alterado com sucesso',
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o plano',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
    setShowPlanDialog(false);
  };

  const handleImpersonate = async () => {
    setIsLoading(true);
    
    try {
      // Fetch an org_admin user for this organization
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('organization_id', organization.id)
        .eq('role', 'org_admin')
        .limit(1)
        .single();

      if (!adminRole) {
        toast({
          title: 'Erro',
          description: 'Nenhum administrador encontrado para esta organização',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Store the impersonation info in localStorage (for demo purposes)
      // In production, you'd use a proper session management system
      localStorage.setItem('impersonating_org', organization.id);
      localStorage.setItem('impersonating_org_name', organization.name);

      toast({
        title: 'Modo de Impersonação',
        description: `Você está visualizando como ${organization.name}. Recarregue a página para ver o dashboard da organização.`,
      });

      // Redirect to organization dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível impersonar a organização',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
    setShowImpersonateDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => window.open(`/book/${organization.id}`, '_blank')}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Ver Página Pública
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowImpersonateDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Impersonar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowPlanDialog(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Alterar Plano
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
            {organization.status === 'inactive' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reativar
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Suspender</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {organization.status === 'inactive' ? 'Reativar' : 'Suspender'} Organização
            </DialogTitle>
            <DialogDescription>
              {organization.status === 'inactive' 
                ? `Deseja reativar a organização "${organization.name}"? Ela voltará a aceitar agendamentos.`
                : `Deseja suspender a organização "${organization.name}"? Ela não poderá mais aceitar agendamentos até ser reativada.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant={organization.status === 'inactive' ? 'default' : 'destructive'}
              onClick={handleSuspend}
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : organization.status === 'inactive' ? 'Reativar' : 'Suspender'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para "{organization.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <div className="flex items-center gap-2">
                    Free <Badge variant="outline">R$ 0/mês</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="starter">
                  <div className="flex items-center gap-2">
                    Starter <Badge variant="outline">R$ 49/mês</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="professional">
                  <div className="flex items-center gap-2">
                    Professional <Badge variant="outline">R$ 299/mês</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex items-center gap-2">
                    Enterprise <Badge variant="outline">R$ 599/mês</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePlanChange} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonar Organização</DialogTitle>
            <DialogDescription>
              Você está prestes a visualizar o sistema como a organização "{organization.name}". 
              Isso é útil para suporte e debugging.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-warning">
                ⚠️ Cuidado: Ações realizadas durante a impersonação afetarão os dados reais da organização.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpersonateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImpersonate} disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar como Organização'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
