import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModeProvider } from "@/contexts/ModeContext";
import { MainLayout } from "@/components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import OCRCallReport from "./pages/OCRCallReport";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/Quotes";
import Receipts from "./pages/Receipts";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Tax from "./pages/Tax";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import PlanManagement from "./pages/PlanManagement";
import NotFound from "./pages/NotFound";
import RoleManagement from "./pages/RoleManagement";
import "./lib/i18n";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ModeProvider>
          <TimeTrackingProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
              {/* Landing Page - Public */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes - Public */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              
              {/* Onboarding - Protected */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              {/* Protected App Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              
              <Route path="/clients" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Clients />} />
              </Route>
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Invoices />} />
              </Route>
              
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Quotes />} />
              </Route>
              
              <Route path="/receipts" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Receipts />} />
              </Route>
              
              <Route path="/services" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Services />} />
              </Route>
              
              <Route path="/products" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Products />} />
              </Route>
              
              <Route path="/tax" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Tax />} />
              </Route>
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Settings />} />
              </Route>
              
              <Route path="/plans" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<PlanManagement />} />
              </Route>
              
              <Route path="/ocr-call-report" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<OCRCallReport />} />
              </Route>
              
              <Route path="/role-management" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<RoleManagement />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
        </TimeTrackingProvider>
        </ModeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
