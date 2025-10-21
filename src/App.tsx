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
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Timesheets from "./pages/Timesheets";
import Notes from "./pages/Notes";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Messages from "./pages/Messages";
import OCRCallReport from "./pages/OCRCallReport";

import Index from "./pages/Index";
import EnterpriseContact from "./pages/EnterpriseContact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import PlanManagement from "./pages/PlanManagement";
import NotFound from "./pages/NotFound";
import StudentClasses from "./pages/StudentClasses";
import StudentAssignments from "./pages/StudentAssignments";
import StudentFiles from "./pages/StudentFiles";
import WorkFiles from "./pages/WorkFiles";
import Lumen from "./pages/Lumen";
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
              <Route path="/enterprise-contact" element={<EnterpriseContact />} />
              
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
              
              <Route path="/timesheets" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Timesheets />} />
              </Route>
              
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Tasks />} />
              </Route>
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Calendar />} />
              </Route>
              
              <Route path="/projects" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Projects />} />
              </Route>
              
              <Route path="/notes" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Notes />} />
              </Route>
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Reports />} />
              </Route>
              
              <Route path="/team" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Team />} />
              </Route>
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Messages />} />
              </Route>
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<History />} />
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
              
              <Route path="/student-classes" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<StudentClasses />} />
              </Route>
              
              <Route path="/student-assignments" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<StudentAssignments />} />
              </Route>
              
              <Route path="/student-files" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<StudentFiles />} />
              </Route>
              
              <Route path="/work-files" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<WorkFiles />} />
              </Route>
              
              <Route path="/lumen" element={
                <ProtectedRoute>
                  <Lumen />
                </ProtectedRoute>
              } />
              
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
