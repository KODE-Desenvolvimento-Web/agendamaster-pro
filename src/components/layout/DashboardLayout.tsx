import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isOrgAdmin = user?.role === 'org_admin';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      
      {/* WhatsApp Support Button - Only for Org Admins */}
      {isOrgAdmin && (
        <a
          href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o AgendaMaster Pro."
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "flex items-center gap-2 px-4 py-3 rounded-full",
            "bg-[#25D366] text-white font-medium shadow-lg",
            "hover:bg-[#20BD5A] hover:shadow-xl transition-all duration-200",
            "animate-fade-in"
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Suporte</span>
        </a>
      )}
    </SidebarProvider>
  );
}
