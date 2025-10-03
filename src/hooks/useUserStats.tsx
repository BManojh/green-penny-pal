import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  totalCO2Saved: number;
  totalMoneySaved: number;
  totalActivities: number;
  currentWeekCO2: number;
  currentWeekMoney: number;
  currentLevel: number;
  currentStreak: number;
  loading: boolean;
  error: string | null;
}

export const useUserStats = (userId: string): UserStats => {
  const [stats, setStats] = useState<UserStats>({
    totalCO2Saved: 0,
    totalMoneySaved: 0,
    totalActivities: 0,
    currentWeekCO2: 0,
    currentWeekMoney: 0,
    currentLevel: 1,
    currentStreak: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchUserStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Fetch all activities for this user
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (activitiesError) {
          throw activitiesError;
        }

        if (!activities || activities.length === 0) {
          setStats(prev => ({
            ...prev,
            loading: false,
            totalCO2Saved: 0,
            totalMoneySaved: 0,
            totalActivities: 0,
            currentWeekCO2: 0,
            currentWeekMoney: 0,
            currentLevel: 1,
            currentStreak: 0
          }));
          return;
        }

        // Calculate total CO2 and money saved
        const totalCO2Saved = activities.reduce((sum, activity) => 
          sum + (activity.co2_impact || 0), 0
        );
        
        const totalMoneySaved = activities.reduce((sum, activity) => 
          sum + (activity.financial_impact || 0), 0
        );

        // Calculate current week stats (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const currentWeekActivities = activities.filter(activity => 
          new Date(activity.created_at) >= oneWeekAgo
        );

        const currentWeekCO2 = currentWeekActivities.reduce((sum, activity) => 
          sum + (activity.co2_impact || 0), 0
        );
        
        const currentWeekMoney = currentWeekActivities.reduce((sum, activity) => 
          sum + (activity.financial_impact || 0), 0
        );

        // Calculate user level based on total activities and impact
        const totalActivities = activities.length;
        const currentLevel = Math.floor(Math.sqrt(totalActivities)) + 1;

        // Calculate streak (consecutive days with activities)
        const currentStreak = calculateStreak(activities);

        setStats({
          totalCO2Saved: Math.round(totalCO2Saved * 100) / 100, // Round to 2 decimal places
          totalMoneySaved: Math.round(totalMoneySaved * 100) / 100,
          totalActivities,
          currentWeekCO2: Math.round(currentWeekCO2 * 100) / 100,
          currentWeekMoney: Math.round(currentWeekMoney * 100) / 100,
          currentLevel,
          currentStreak,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats'
        }));
      }
    };

    fetchUserStats();

    // Set up real-time subscription for activities
    const subscription = supabase
      .channel(`user-activities-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refetch stats when activities change
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return stats;
};

// Helper function to calculate consecutive days streak
const calculateStreak = (activities: any[]): number => {
  if (!activities || activities.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Get unique activity dates (only the date part, not time)
  const activityDates = new Set(
    activities.map(activity => {
      const date = new Date(activity.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // Count consecutive days starting from today
  while (activityDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

export default useUserStats;