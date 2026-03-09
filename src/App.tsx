import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Trips from "@/pages/Trips";
import Finances from "@/pages/Finances";
import Parts from "@/pages/Parts";
import Intervals from "@/pages/Intervals";
import Stats from "@/pages/Stats";
import Owners from "@/pages/Owners";
import Settings from "@/pages/Settings";
import Icon from "@/components/ui/icon";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--khaki-mid), var(--khaki-light))' }}>
            <Icon name="Car" size={28} style={{ color: 'var(--green-glow)' }} />
          </div>
          <div className="font-display text-2xl font-semibold tracking-wider" style={{ color: 'var(--green-glow)' }}>
            GVM
          </div>
          <Icon name="Loader2" size={20} className="animate-spin mx-auto mt-3" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/intervals" element={<Intervals />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner richColors position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
