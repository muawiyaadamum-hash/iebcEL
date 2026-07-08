import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessCodeProvider } from "@/contexts/AccessCodeContext";
import AccessCodeGate from "@/components/AccessCodeGate";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIChatbot from "@/components/AIChatbot";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Index from "./pages/Index";

// Lazy-load non-critical routes to shrink initial bundle (perf: Lot 6)
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const Register = lazy(() => import("./pages/Register"));
const Enroll = lazy(() => import("./pages/Enroll"));
const About = lazy(() => import("./pages/About"));
const Install = lazy(() => import("./pages/Install"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminLms = lazy(() => import("./pages/AdminLms"));
const PedagogicalDashboard = lazy(() => import("./pages/PedagogicalDashboard"));
const Exam = lazy(() => import("./pages/Exam"));
const Events = lazy(() => import("./pages/Events"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const PartnerProgram = lazy(() => import("./pages/PartnerProgram"));
const VerifyPartnerCertificate = lazy(() => import("./pages/VerifyPartnerCertificate"));
const LiveSession = lazy(() => import("./pages/LiveSession"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AccessCodeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AccessCodeGate>
              <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/learn/:id" element={
                      <ProtectedRoute>
                        <CourseViewer />
                      </ProtectedRoute>
                    } />
                    <Route path="/register" element={<Register />} />
                    <Route path="/inscription" element={<Enroll />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/etudiant" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminLms />
                      </ProtectedRoute>
                    } />
                    <Route path="/pedagogique" element={
                      <ProtectedRoute>
                        <PedagogicalDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/exam/:slug" element={
                      <ProtectedRoute>
                        <Exam />
                      </ProtectedRoute>
                    } />
                    <Route path="/verify/:code" element={<VerifyCertificate />} />
                    <Route path="/live/:id" element={
                      <ProtectedRoute>
                        <LiveSession />
                      </ProtectedRoute>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <AIChatbot />
                <FloatingWhatsApp />
              </BrowserRouter>
            </AccessCodeGate>
          </TooltipProvider>
        </AuthProvider>
      </AccessCodeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
