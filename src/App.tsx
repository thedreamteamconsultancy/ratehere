import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { useServiceWorker } from "./hooks/use-service-worker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageRatings from "./pages/ManageRatings";
import ManageProfiles from "./pages/ManageProfiles";
import SystemLogs from "./pages/SystemLogs";
import CreateProfile from "./pages/CreateProfile";
import ProfileView from "./pages/ProfileView";
import Leaderboard from "./pages/Leaderboard";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Register service worker for PWA
  useServiceWorker();

  return (
    <>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin>
                <ManageUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/ratings" 
            element={
              <ProtectedRoute requireAdmin>
                <ManageRatings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/profiles" 
            element={
              <ProtectedRoute requireAdmin>
                <ManageProfiles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <ProtectedRoute requireAdmin>
                <SystemLogs />
              </ProtectedRoute>
            } 
          />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/edit-profile/:id" element={<CreateProfile />} />
          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
