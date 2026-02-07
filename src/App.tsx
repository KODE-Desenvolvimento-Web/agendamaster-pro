import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
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

// Redirect component based on user role
function RoleBasedRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <OrgDashboard />;
  }
  
  if (user.role === 'super_admin') {
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
              {/* Default redirect */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Super Admin Routes */}
              <Route path="/admin" element={<SuperAdminDashboard />} />
              <Route path="/admin/organizations" element={<SuperAdminDashboard />} />
              <Route path="/admin/analytics" element={<SuperAdminDashboard />} />
              <Route path="/admin/billing" element={<SuperAdminDashboard />} />
              <Route path="/admin/settings" element={<SuperAdminDashboard />} />
              
              {/* Organization Admin Routes */}
              <Route path="/dashboard" element={<OrgDashboard />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              
              {/* Settings Routes */}
              <Route path="/settings" element={<BrandingSettingsPage />} />
              <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
              <Route path="/settings/payments" element={<BrandingSettingsPage />} />
              <Route path="/settings/branding" element={<BrandingSettingsPage />} />
              
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
