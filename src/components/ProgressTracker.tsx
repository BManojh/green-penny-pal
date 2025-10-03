import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useUserStats } from "@/hooks/useUserStats";

interface ProgressTrackerDBProps {
  userId: string;
}

interface WeekData {
  week: string;
  ecoScore: number;
  financeSaving: number;
}

export const ProgressTracker = ({ userId }: ProgressTrackerDBProps) => {
  const { 
    totalCO2Saved, 
    totalMoneySaved, 
    totalActivities, 
    currentWeekCO2, 
    currentWeekMoney, 
    currentLevel,
    currentStreak,
    loading 
  } = useUserStats(userId);

  // Generate mock weekly data for visualization (in a real app, you'd fetch this from database)
  const weeklyData: WeekData[] = [
    { week: "Week 1", ecoScore: Math.round(currentWeekCO2 * 0.3), financeSaving: Math.round(currentWeekMoney * 0.3) },
    { week: "Week 2", ecoScore: Math.round(currentWeekCO2 * 0.5), financeSaving: Math.round(currentWeekMoney * 0.5) },
    { week: "Week 3", ecoScore: Math.round(currentWeekCO2 * 0.8), financeSaving: Math.round(currentWeekMoney * 0.8) },
    { week: "This Week", ecoScore: Math.round(currentWeekCO2), financeSaving: Math.round(currentWeekMoney) }
  ];

  // Generate achievement based on user stats
  const achievements = [];
  if (totalActivities >= 5) {
    achievements.push({
      name: "Eco Warrior",
      description: `Completed ${totalActivities} activities`,
      icon: "🌿",
      unlocked_at: new Date().toISOString()
    });
  }
  if (currentStreak >= 3) {
    achievements.push({
      name: "Consistency Champion",
      description: `${currentStreak} day streak`,
      icon: "🔥",
      unlocked_at: new Date().toISOString()
    });
  }

  if (loading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Weekly Progress</h2>
        </div>
        <div className="text-center text-muted-foreground py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your progress...</p>
        </div>
      </Card>
    );
  }

  if (totalActivities === 0) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Weekly Progress</h2>
        </div>
        <p className="text-center text-muted-foreground py-8">
          Start logging activities to track your progress!
        </p>
      </Card>
    );
  }

  const currentWeek = weeklyData[weeklyData.length - 1];
  const previousWeek = weeklyData[weeklyData.length - 2];
  const ecoGrowth = previousWeek
    ? currentWeek.ecoScore - previousWeek.ecoScore
    : currentWeek.ecoScore;
  const financeGrowth = previousWeek
    ? currentWeek.financeSaving - previousWeek.financeSaving
    : currentWeek.financeSaving;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Weekly Progress</h2>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Eco Score Growth</span>
                <span className="text-sm font-bold text-primary">+{ecoGrowth.toFixed(0)} points</span>
              </div>
              <Progress value={Math.min(100, ecoGrowth * 10)} className="h-2" />
            </div>
          </Card>

          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Savings Growth</span>
                <span className="text-sm font-bold text-secondary">+₹{financeGrowth.toFixed(0)}</span>
              </div>
              <Progress value={Math.min(100, (financeGrowth / 500) * 100)} className="h-2" />
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {weeklyData.map((week, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{week.week}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-primary font-medium">
                    Eco: {week.ecoScore.toFixed(0)}
                  </span>
                  <span className="text-sm text-secondary font-medium">
                    ₹{week.financeSaving.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Progress value={week.ecoScore} className="h-1.5" />
                <Progress value={Math.min(100, (week.financeSaving / 1500) * 100)} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>

        {achievements.length > 0 && (
          <Card className="p-4 bg-gradient-eco border-0">
            <div className="text-center space-y-1">
              <p className="text-primary-foreground/90 text-sm font-medium">
                🎉 Latest Achievement!
              </p>
              <p className="text-primary-foreground font-bold text-lg">
                {achievements[0].title}
              </p>
              <p className="text-primary-foreground/80 text-xs">
                {achievements[0].description}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};
