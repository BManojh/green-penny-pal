import { Routes, Route } from "react-router-dom";
import { CommunityHub } from "@/components/CommunityHub";
import { useAuth } from "@/hooks/useAuth";
import { Users } from "lucide-react";

const CommunityOverview = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
          <Users className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Hub</h1>
          <p className="text-muted-foreground">Connect with eco-warriors around the world</p>
        </div>
      </div>

      {/* Community Hub */}
      <CommunityHub userId={user.id} />
    </div>
  );
};

const Community = () => {
  return (
    <Routes>
      <Route path="/" element={<CommunityOverview />} />
      <Route path="/leaderboard" element={<CommunityOverview />} />
      <Route path="/challenges" element={<CommunityOverview />} />
      <Route path="/feed" element={<CommunityOverview />} />
      <Route path="/impact" element={<CommunityOverview />} />
    </Routes>
  );
};

export default Community;