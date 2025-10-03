import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Trophy, Target, Flame, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/lib/gamification-engine";

interface EnhancedProgressTrackerProps {
  userId: string;
}

export const EnhancedProgressTracker = ({ userId }: EnhancedProgressTrackerProps) => {
  const [userStats, setUserStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any>(null);
  const { getUserProgress } = useGamification();

  useEffect(() => {
    fetchUserProgress();
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      // Fetch user activities and calculate stats
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: userAchievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (activities) {
        const stats = calculateUserStats(activities);
        const progress = getUserProgress(stats);
        
        setUserStats(stats);
        setAchievements(userAchievements || []);
        setChallenges(progress.challenges);
        setStreaks(calculateStreaks(activities));
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const calculateUserStats = (activities: any[]) => {
    const totalActivities = activities.length;
    const totalCO2Saved = activities.reduce((sum, a) => sum + a.co2_impact, 0);
    const totalMoneySaved = activities.reduce((sum, a) => sum + a.financial_impact, 0);
    
    // Calculate XP (simplified)
    const totalXP = activities.length * 15 + Math.floor(totalCO2Saved * 2);
    
    // Activity patterns
    const ecoTransportCount = activities.filter(a => 
      a.category === 'travel' && ['Bike', 'Public Transport', 'Walking'].includes(a.activity_type)
    ).length;
    
    const plantBasedMeals = activities.filter(a => 
      a.category === 'food' && ['Vegetarian', 'Vegan', 'Local Produce'].includes(a.activity_type)
    ).length;

    const categoryDiversity = new Set(activities.map(a => a.category)).size;

    return {
      totalActivities,
      totalCO2Saved,
      totalMoneySaved,
      totalXP,
      ecoTransportCount,
      plantBasedMeals,
      categoryDiversity,
      carUsage: activities.filter(a => a.activity_type === 'Car').length,
      meatConsumption: activities.filter(a => a.activity_type === 'Meat').length
    };
  };

  const calculateStreaks = (activities: any[]) => {
    if (!activities.length) return { current: 0, longest: 0, multiplier: 1.0 };

    const dates = activities.map(a => new Date(a.created_at).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if user has activity today or yesterday
    if (uniqueDates.includes(today)) {
      currentStreak = 1;
    } else if (uniqueDates.includes(yesterday)) {
      currentStreak = 1;
    } else {
      currentStreak = 0;
    }

    // Calculate streak from most recent date backwards
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const current = new Date(uniqueDates[i + 1]);
      const previous = new Date(uniqueDates[i]);
      const dayDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    const multiplier = currentStreak >= 7 ? 2.0 : currentStreak >= 3 ? 1.5 : 1.0;
    
    return { current: currentStreak, longest: longestStreak, multiplier };
  };

  if (!userStats) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  const progress = getUserProgress(userStats);
  const progressPercentage = progress.nextLevel ? 
    ((userStats.totalXP - progress.currentLevel.xp) / (progress.nextLevel.xp - progress.currentLevel.xp)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{progress.currentLevel.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{progress.currentLevel.title}</h2>
              <p className="text-sm text-muted-foreground">Level {progress.currentLevel.level}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {userStats.totalXP.toLocaleString()} XP
          </Badge>
        </div>

        {progress.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {progress.nextLevel.title}</span>
              <span>{Math.floor(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {progress.nextLevel.xp - userStats.totalXP} XP to next level
            </p>
          </div>
        )}
      </Card>

      {/* Streaks & Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-foreground">{streaks.current}</div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
          <div className="text-xs text-orange-600 mt-1">
            {streaks.multiplier}x XP Multiplier
          </div>
        </Card>

        <Card className="p-4 text-center">
          <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold text-foreground">
            {userStats.totalCO2Saved.toFixed(1)}
          </div>
          <p className="text-sm text-muted-foreground">kg CO₂ Saved</p>
        </Card>

        <Card className="p-4 text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-foreground">
            ₹{userStats.totalMoneySaved.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Money Saved</p>
        </Card>
      </div>

      {/* Tabs for detailed progress */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Recent Achievements</h3>
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                    <div className="text-2xl">{achievement.badge_icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="outline">{achievement.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Complete activities to unlock achievements!
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Active Challenges</h3>
            {challenges.length > 0 ? (
              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">{challenge.title}</h4>
                      <Badge variant="secondary">
                        {challenge.current}/{challenge.target}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <Progress 
                      value={(challenge.current / challenge.target) * 100} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Reward: {challenge.reward}</span>
                      <span className="text-muted-foreground">
                        Ends: {new Date(challenge.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Complete more activities to unlock challenges!
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Personal Analytics</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground">Eco Transport Usage</div>
                  <div className="text-xl font-semibold text-primary">
                    {userStats.ecoTransportCount} trips
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs {userStats.carUsage} car trips
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground">Plant-Based Meals</div>
                  <div className="text-xl font-semibold text-secondary">
                    {userStats.plantBasedMeals} meals
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs {userStats.meatConsumption} meat meals
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Category Diversity</div>
                <div className="text-xl font-semibold text-accent-foreground">
                  {userStats.categoryDiversity}/4 categories explored
                </div>
                <Progress value={(userStats.categoryDiversity / 4) * 100} className="h-2 mt-2" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};