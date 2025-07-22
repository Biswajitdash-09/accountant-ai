
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Accounts from "./Accounts";
import Reports from "./Reports";
import Tax from "./Tax";
import Upload from "./Upload";
import Assistant from "./Assistant";
import NotFound from "./NotFound";

const App = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <Layout>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/accounts" 
        element={
          <ProtectedRoute>
            <Layout>
              <Accounts />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tax" 
        element={
          <ProtectedRoute>
            <Layout>
              <Tax />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <Layout>
              <Upload />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/assistant" 
        element={
          <ProtectedRoute>
            <Layout>
              <Assistant />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const Index = () => {
  return <App />;
};

export default Index;
