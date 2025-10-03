import { Routes, Route } from "react-router-dom";
import { EnhancedProgressTracker } from "@/components/EnhancedProgressTracker";
import { useAuth } from "@/hooks/useAuth";
import { Trophy } from "lucide-react";

const ProgressOverview = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10">
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Progress & Achievements</h1>
          <p className="text-muted-foreground">Track your eco-journey milestones and rewards</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <EnhancedProgressTracker userId={user.id} />
    </div>
  );
};

const Progress = () => {
  return (
    <Routes>
      <Route path="/" element={<ProgressOverview />} />
      <Route path="/achievements" element={<ProgressOverview />} />
      <Route path="/levels" element={<ProgressOverview />} />
      <Route path="/streaks" element={<ProgressOverview />} />
      <Route path="/challenges" element={<ProgressOverview />} />
    </Routes>
  );
};

export default Progress;