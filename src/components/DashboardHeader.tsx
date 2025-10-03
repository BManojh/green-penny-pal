import { Leaf, TrendingUp, Sprout, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStats } from "@/hooks/useUserStats";

interface DashboardHeaderDBProps {
  userId: string;
  onSignOut: () => void;
}

export const DashboardHeader = ({ userId, onSignOut }: DashboardHeaderDBProps) => {
  const { 
    totalCO2Saved, 
    totalMoneySaved, 
    totalActivities, 
    currentLevel,
    loading 
  } = useUserStats(userId);

  // Calculate derived stats from real data
  const treesSaved = Math.floor(totalCO2Saved / 12); // 1 tree = ~12kg CO2/year
  const ecoScore = Math.min(100, totalActivities * 5 + treesSaved);
  const financeScore = Math.min(100, Math.floor(totalMoneySaved / 50));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">
            Your Impact Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your eco-friendly journey and savings
          </p>
        </div>
        <Button onClick={onSignOut} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-gradient-eco shadow-eco border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Eco Score</p>
              <p className="text-4xl font-bold text-primary-foreground mt-1">{loading ? '...' : ecoScore}</p>
              <div className="flex items-center gap-2 mt-2">
                <Leaf className="h-4 w-4 text-primary-foreground/80" />
                <span className="text-primary-foreground/90 text-sm">
                  {treesSaved} trees saved
                </span>
              </div>
            </div>
            <div className="h-20 w-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Sprout className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-finance shadow-eco border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-foreground/80 text-sm font-medium">Finance Score</p>
              <p className="text-4xl font-bold text-secondary-foreground mt-1">
                {loading ? '...' : financeScore}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-secondary-foreground/80" />
                <span className="text-secondary-foreground/90 text-sm">
                  ₹{totalMoneySaved.toFixed(0)} saved
                </span>
              </div>
            </div>
            <div className="h-20 w-20 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-secondary-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : treesSaved}</p>
              <p className="text-sm text-muted-foreground">Trees Saved</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : totalCO2Saved.toFixed(1)}kg</p>
              <p className="text-sm text-muted-foreground">CO₂ Reduced</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{loading ? '...' : totalMoneySaved.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Money Saved</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
