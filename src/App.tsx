
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { MobileQuickActions } from "@/components/mobile/MobileQuickActions";
import { MobileSyncStatus } from "@/components/mobile/MobileSyncStatus";
import "./App.css";

// Eager load only critical public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";

// Lazy load all other pages for better code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Accounts = lazy(() => import("./pages/Accounts"));
const Reports = lazy(() => import("./pages/Reports"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AdvancedFeatures = lazy(() => import("./pages/AdvancedFeaturesEnhanced"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Tax = lazy(() => import("./pages/Tax"));
const Upload = lazy(() => import("./pages/Upload"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Markets = lazy(() => import("./pages/Markets"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Performance = lazy(() => import("./pages/Performance"));
const Security = lazy(() => import("./pages/Security"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Scanner = lazy(() => import("./pages/Scanner"));
const HMRCIntegration = lazy(() => import("./pages/HMRCIntegration"));
const HMRCCallback = lazy(() => import("./components/hmrc/HMRCCallback"));
const Integrations = lazy(() => import("./pages/Integrations"));
const APILicensing = lazy(() => import("./pages/APILicensing"));
const DeveloperDocs = lazy(() => import("./pages/DeveloperDocs"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <OfflineIndicator />
      <MobileQuickActions />
      <MobileSyncStatus />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          
          {/* Onboarding route - protected but no layout */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Protected routes wrapped in Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <Layout>
                <Accounts />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/advanced-features" element={
            <ProtectedRoute>
              <Layout>
                <AdvancedFeatures />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={
            <ProtectedRoute>
              <Layout>
                <Pricing />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tax" element={
            <ProtectedRoute>
              <Layout>
                <Tax />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/assistant" element={
            <ProtectedRoute>
              <Layout>
                <AIAssistant />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/markets" element={
            <ProtectedRoute>
              <Layout>
                <Markets />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Layout>
                <Performance />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security" element={
            <ProtectedRoute>
              <Layout>
                <Security />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/scanner" element={
            <ProtectedRoute>
              <Layout>
                <Scanner />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Legacy routes - redirect to new consolidated pages */}
          <Route path="/barcode" element={<Navigate to="/scanner" replace />} />
          <Route path="/scan-history" element={<Navigate to="/scanner?tab=history" replace />} />
          <Route path="/advanced-analytics" element={<Navigate to="/analytics?tab=predictions" replace />} />
          <Route path="/hmrc" element={
            <ProtectedRoute>
              <HMRCIntegration />
            </ProtectedRoute>
          } />
          <Route path="/hmrc/callback" element={
            <ProtectedRoute>
              <HMRCCallback />
            </ProtectedRoute>
          } />
          <Route path="/integrations" element={
            <ProtectedRoute>
              <Layout>
                <Integrations />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/api-licensing" element={
            <ProtectedRoute>
              <Layout>
                <APILicensing />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/api-docs" element={
            <ProtectedRoute>
              <Layout>
                <DeveloperDocs />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute>
              <Layout>
                <HelpCenter />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Default redirect to dashboard */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </TooltipProvider>
  );
}

export default App;
