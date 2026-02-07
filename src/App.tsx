import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import AuthPage from "./pages/auth/AuthPage";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import OrgDashboard from "./pages/dashboard/OrgDashboard";
import CalendarPage from "./pages/calendar/CalendarPage";
import ServicesPage from "./pages/services/ServicesPage";
import CustomersPage from "./pages/customers/CustomersPage";
import ReportsPage from "./pages/reports/ReportsPage";
import NotificationsSettingsPage from "./pages/settings/NotificationsSettingsPage";
import BrandingSettingsPage from "./pages/settings/BrandingSettingsPage";
import BookingPage from "./pages/booking/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mx-auto mb-4 animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold">AgendaMaster Pro</h1>
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Redirect component based on user role
function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mx-auto mb-4 animate-pulse-glow">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold">AgendaMaster Pro</h1>
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user?.role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Page */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Default redirect */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Super Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/organizations" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/billing" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
              
              {/* Organization Admin Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              
              {/* Settings Routes */}
              <Route path="/settings" element={<ProtectedRoute><BrandingSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/payments" element={<ProtectedRoute><BrandingSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/branding" element={<ProtectedRoute><BrandingSettingsPage /></ProtectedRoute>} />
              
              {/* Public Booking Page */}
              <Route path="/book/:slug" element={<BookingPage />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
