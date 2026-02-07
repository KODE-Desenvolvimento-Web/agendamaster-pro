import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Erro ao entrar',
              description: 'Email ou senha incorretos. Verifique suas credenciais.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao entrar',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Bem-vindo de volta!',
          description: 'Login realizado com sucesso.',
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Usuário já cadastrado',
              description: 'Este email já está registrado. Tente fazer login.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro ao cadastrar',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar o cadastro.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-primary/5 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AgendaMaster Pro</h1>
            <p className="text-sm text-muted-foreground">Sistema de Agendamento</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Gerencie seu negócio com
            <span className="text-primary block">eficiência e elegância</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Plataforma completa para gestão de agendamentos, clientes e serviços. 
            Simplifique sua rotina e aumente sua produtividade.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Empresas ativas</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4">
              <p className="text-3xl font-bold text-primary">50k+</p>
              <p className="text-sm text-muted-foreground">Agendamentos/mês</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4">
              <p className="text-3xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime garantido</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4">
              <p className="text-3xl font-bold text-primary">4.9★</p>
              <p className="text-sm text-muted-foreground">Avaliação média</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 AgendaMaster Pro. Todos os direitos reservados.
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AgendaMaster Pro</h1>
              <p className="text-sm text-muted-foreground">Sistema de Agendamento</p>
            </div>
          </div>

          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Entre com suas credenciais para acessar o sistema' 
                  : 'Preencha os dados abaixo para criar sua conta'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Entrando...' : 'Criando conta...'}
                    </>
                  ) : (
                    isLogin ? 'Entrar' : 'Criar conta'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Criar agora' : 'Entrar'}
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
