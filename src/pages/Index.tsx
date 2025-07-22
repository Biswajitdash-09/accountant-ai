
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
        element={
          <Layout>
            <Dashboard />
          </Layout>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <Layout>
            <Transactions />
          </Layout>
        } 
      />
      <Route 
        path="/accounts" 
        element={
          <Layout>
            <Accounts />
          </Layout>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <Layout>
            <Reports />
          </Layout>
        } 
      />
      <Route 
        path="/tax" 
        element={
          <Layout>
            <Tax />
          </Layout>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <Layout>
            <Upload />
          </Layout>
        } 
      />
      <Route 
        path="/assistant" 
        element={
          <Layout>
            <Assistant />
          </Layout>
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
