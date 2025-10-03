import { Routes, Route } from "react-router-dom";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3 } from "lucide-react";

const AnalyticsOverview = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <BarChart3 className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your environmental impact</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard userId={user.id} />
    </div>
  );
};

const Analytics = () => {
  return (
    <Routes>
      <Route path="/" element={<AnalyticsOverview />} />
      <Route path="/trends" element={<AnalyticsOverview />} />
      <Route path="/predictions" element={<AnalyticsOverview />} />
      <Route path="/compare" element={<AnalyticsOverview />} />
    </Routes>
  );
};

export default Analytics;