
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Layout from '@/components/Layout';

const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced financial analytics with predictive insights
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default Analytics;
