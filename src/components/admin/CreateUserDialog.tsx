import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';

const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  role: z.enum(['super_admin', 'org_admin', 'staff', 'customer']),
  organization_id: z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface Organization {
  id: string;
  name: string;
}

interface CreateUserDialogProps {
  organizations?: Organization[];
  onUserCreated?: () => void;
  allowedRoles?: UserRole[];
  defaultOrganizationId?: string;
}

export function CreateUserDialog({
  organizations = [],
  onUserCreated,
  allowedRoles,
  defaultOrganizationId,
}: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';

  const availableRoles: { value: UserRole; label: string }[] = allowedRoles
    ? allowedRoles.map(role => ({
        value: role,
        label: getRoleLabel(role),
      }))
    : isSuperAdmin
    ? [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'org_admin', label: 'Admin da Organização' },
        { value: 'staff', label: 'Funcionário' },
        { value: 'customer', label: 'Cliente' },
      ]
    : [
        { value: 'staff', label: 'Funcionário' },
        { value: 'customer', label: 'Cliente' },
      ];

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      role: availableRoles[0]?.value || 'customer',
      organization_id: defaultOrganizationId || '',
    },
  });

  const selectedRole = form.watch('role');
  const needsOrganization = selectedRole !== 'super_admin';

  async function onSubmit(data: CreateUserForm) {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create_user',
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          role: data.role,
          organization_id: needsOrganization ? data.organization_id : null,
        },
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);

      toast({
        title: 'Usuário criado',
        description: `${data.full_name} foi criado com sucesso.`,
      });

      form.reset();
      setOpen(false);
      onUserCreated?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsOrganization && organizations.length > 0 && (
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organização</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a organização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Usuário
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Admin da Organização',
    staff: 'Funcionário',
    customer: 'Cliente',
  };
  return labels[role];
}
