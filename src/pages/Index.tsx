import { DashboardHeader } from "@/components/DashboardHeader";
import { ActivityLogger } from "@/components/ActivityLogger";
import { EcoSuggestions } from "@/components/EcoSuggestions";
import { ProgressTracker } from "@/components/ProgressTracker";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <DashboardHeader userId={user.id} onSignOut={() => {}} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ActivityLogger userId={user.id} onActivityLogged={() => window.location.reload()} />
          <ProgressTracker userId={user.id} />
        </div>

        <div>
          <EcoSuggestions userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Index;
