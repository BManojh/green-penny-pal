import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";

// Import pages - using relative paths to avoid module resolution issues
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import TrackActivities from "../pages/TrackActivities";
import Analytics from "../pages/Analytics";
import Progress from "../pages/Progress";
import Community from "../pages/Community";
import Insights from "../pages/Insights";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import FinanceManager from "../pages/FinanceManager";

export const Layout = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get dynamic user stats
  const { currentLevel, currentStreak } = useUserStats(user?.id || '');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dynamic user level data
  const userLevel = {
    level: currentLevel,
    title: currentLevel > 5 ? "Eco Warrior" : currentLevel > 3 ? "Green Guardian" : "Eco Beginner",
    icon: "🌿"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        onSignOut={signOut}
        notifications={3} // Could be dynamic based on unread notifications
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/track" element={<TrackActivities />} />
          <Route path="/analytics/*" element={<Analytics />} />
          <Route path="/progress/*" element={<Progress />} />
          <Route path="/community/*" element={<Community />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/finance" element={<FinanceManager />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};