import { 
  Calendar, 
  Users, 
  Briefcase, 
  LayoutDashboard, 
  Settings, 
  Building2, 
  BarChart3,
  Bell,
  CreditCard,
  Palette,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const superAdminNavItems = [
  { title: 'Painel', url: '/admin', icon: LayoutDashboard },
  { title: 'Organizações', url: '/admin/organizations', icon: Building2 },
  { title: 'Análises', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Faturamento', url: '/admin/billing', icon: CreditCard },
  { title: 'Configurações', url: '/admin/settings', icon: Settings },
];

const orgAdminNavItems = [
  { title: 'Painel', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Agenda', url: '/calendar', icon: Calendar },
  { title: 'Serviços', url: '/services', icon: Briefcase },
  { title: 'Clientes', url: '/customers', icon: Users },
  { title: 'Relatórios', url: '/reports', icon: BarChart3 },
];

const orgAdminSettingsItems = [
  { title: 'Notificações', url: '/settings/notifications', icon: Bell },
  { title: 'Pagamentos', url: '/settings/payments', icon: CreditCard },
  { title: 'Identidade Visual', url: '/settings/branding', icon: Palette },
  { title: 'Geral', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { user, organization, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const navItems = isSuperAdmin ? superAdminNavItems : orgAdminNavItems;
  const settingsItems = isSuperAdmin ? [] : orgAdminSettingsItems;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">AgendaMaster</span>
            <span className="text-xs text-muted-foreground">
              {isSuperAdmin ? 'Super Admin' : 'Pro'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Organization Info (for org admins) */}
        {organization && !isSuperAdmin && (
          <div className="mb-4 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {organization.name}
                </p>
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-4 bg-success/10 text-success border-0"
                >
                  {organization.plan}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-1">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Navigation (for org admins) */}
        {settingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-1">
              Configurações
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                            isActive 
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-2">
          <span className="text-xs text-muted-foreground">Tema</span>
          <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "p-1.5 rounded-md transition-smooth",
                theme === 'light' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "p-1.5 rounded-md transition-smooth",
                theme === 'dark' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                "p-1.5 rounded-md transition-smooth",
                theme === 'system' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Role Badge */}
        {user?.role && (
          <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs text-primary">
              {user.role === 'super_admin' ? 'Super Admin' : 
               user.role === 'org_admin' ? 'Admin' : 
               user.role === 'staff' ? 'Funcionário' : 'Cliente'}
            </span>
          </div>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-smooth hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9 border-2 border-sidebar-border">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Ajuda & Suporte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
