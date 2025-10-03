// Advanced Gamification System

export interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  benefits: string[];
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xpReward: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface UserStreaks {
  current: number;
  longest: number;
  type: 'daily' | 'weekly' | 'monthly';
  lastActivity: Date;
  multiplier: number;
}

export class GamificationEngine {
  private levels: UserLevel[] = [
    { level: 1, title: 'Eco Novice', xp: 0, xpToNext: 100, benefits: ['Basic tracking'], icon: '🌱' },
    { level: 2, title: 'Green Explorer', xp: 100, xpToNext: 200, benefits: ['AI suggestions'], icon: '🌿' },
    { level: 3, title: 'Sustainability Seeker', xp: 300, xpToNext: 400, benefits: ['Advanced analytics'], icon: '🍃' },
    { level: 4, title: 'Climate Champion', xp: 700, xpToNext: 600, benefits: ['Community features'], icon: '🌳' },
    { level: 5, title: 'Carbon Ninja', xp: 1300, xpToNext: 800, benefits: ['Premium insights'], icon: '🥷' },
    { level: 6, title: 'Eco Warrior', xp: 2100, xpToNext: 1000, benefits: ['Leadership board'], icon: '⚔️' },
    { level: 7, title: 'Planet Protector', xp: 3100, xpToNext: 1200, benefits: ['Custom goals'], icon: '🛡️' },
    { level: 8, title: 'Green Guru', xp: 4300, xpToNext: 1500, benefits: ['Mentor status'], icon: '🧘' },
    { level: 9, title: 'Sustainability Sage', xp: 5800, xpToNext: 2000, benefits: ['Expert insights'], icon: '🧙‍♂️' },
    { level: 10, title: 'Earth Guardian', xp: 7800, xpToNext: 0, benefits: ['Ultimate status'], icon: '🌍' }
  ];

  private achievements: Achievement[] = [
    // Beginner achievements
    {
      id: 'first_activity',
      title: 'First Steps',
      description: 'Log your first eco-activity',
      icon: '👶',
      rarity: 'Common',
      xpReward: 50,
      maxProgress: 1
    },
    {
      id: 'week_streak',
      title: 'Weekly Warrior',
      description: 'Maintain a 7-day activity streak',
      icon: '🔥',
      rarity: 'Rare',
      xpReward: 200,
      maxProgress: 7
    },
    {
      id: 'transport_switch',
      title: 'Transport Transformer',
      description: 'Switch from car to eco-friendly transport 10 times',
      icon: '🚲',
      rarity: 'Rare',
      xpReward: 150,
      maxProgress: 10
    },
    
    // Intermediate achievements
    {
      id: 'co2_saver_100',
      title: 'CO₂ Saver',
      description: 'Save 100kg of CO₂ emissions',
      icon: '🌬️',
      rarity: 'Epic',
      xpReward: 300,
      maxProgress: 100
    },
    {
      id: 'money_saver_5000',
      title: 'Penny Pincher',
      description: 'Save ₹5,000 through eco-choices',
      icon: '💰',
      rarity: 'Epic',
      xpReward: 250,
      maxProgress: 5000
    },
    {
      id: 'month_perfect',
      title: 'Monthly Master',
      description: 'Log activities every day for a month',
      icon: '📅',
      rarity: 'Epic',
      xpReward: 500,
      maxProgress: 30
    },
    
    // Advanced achievements
    {
      id: 'plant_based_champion',
      title: 'Plant-Based Champion',
      description: 'Choose plant-based meals 100 times',
      icon: '🥬',
      rarity: 'Epic',
      xpReward: 400,
      maxProgress: 100
    },
    {
      id: 'zero_emissions_week',
      title: 'Zero Emissions Hero',
      description: 'Achieve net-zero transport emissions for a week',
      icon: '⚡',
      rarity: 'Legendary',
      xpReward: 1000,
      maxProgress: 7
    },
    {
      id: 'community_leader',
      title: 'Community Leader',
      description: 'Help 50 people improve their eco-score',
      icon: '👑',
      rarity: 'Legendary',
      xpReward: 1500,
      maxProgress: 50
    }
  ];

  calculateXP(activity: any): number {
    const baseXP = 10;
    const ecoBonus = Math.max(0, activity.co2_impact) * 2; // Bonus for high-impact activities
    const costBonus = Math.max(0, activity.financial_impact) * 0.01; // Bonus for cost savings
    
    return Math.floor(baseXP + ecoBonus + costBonus);
  }

  calculateStreakMultiplier(streaks: UserStreaks): number {
    if (streaks.current >= 30) return 3.0; // 30-day streak = 3x multiplier
    if (streaks.current >= 14) return 2.5; // 2-week streak = 2.5x multiplier
    if (streaks.current >= 7) return 2.0;  // 1-week streak = 2x multiplier
    if (streaks.current >= 3) return 1.5;  // 3-day streak = 1.5x multiplier
    return 1.0; // No multiplier
  }

  updateStreaks(userId: string, lastActivity: Date): UserStreaks {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    // Load existing streaks from database (mock implementation)
    let streaks: UserStreaks = {
      current: 0,
      longest: 0,
      type: 'daily',
      lastActivity: new Date(),
      multiplier: 1.0
    };
    
    if (daysDiff === 0) {
      // Activity today, streak continues
      return streaks;
    } else if (daysDiff === 1) {
      // Activity yesterday, increment streak
      streaks.current += 1;
      streaks.longest = Math.max(streaks.longest, streaks.current);
    } else {
      // Streak broken
      streaks.current = 1;
    }
    
    streaks.multiplier = this.calculateStreakMultiplier(streaks);
    streaks.lastActivity = today;
    
    return streaks;
  }

  checkAchievements(userId: string, userStats: any): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    
    for (const achievement of this.achievements) {
      if (this.isAchievementUnlocked(achievement, userStats)) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    }
    
    return unlockedAchievements;
  }

  private isAchievementUnlocked(achievement: Achievement, stats: any): boolean {
    switch (achievement.id) {
      case 'first_activity':
        return stats.totalActivities >= 1;
      
      case 'week_streak':
        return stats.currentStreak >= 7;
      
      case 'co2_saver_100':
        return stats.totalCO2Saved >= 100;
      
      case 'money_saver_5000':
        return stats.totalMoneySaved >= 5000;
      
      case 'transport_switch':
        return stats.ecoTransportCount >= 10;
      
      case 'plant_based_champion':
        return stats.plantBasedMeals >= 100;
      
      case 'zero_emissions_week':
        return stats.zeroEmissionsDays >= 7;
      
      default:
        return false;
    }
  }

  getCurrentLevel(xp: number): UserLevel {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (xp >= this.levels[i].xp) {
        return this.levels[i];
      }
    }
    return this.levels[0];
  }

  getNextLevel(xp: number): UserLevel | null {
    const currentLevel = this.getCurrentLevel(xp);
    const nextLevelIndex = this.levels.findIndex(l => l.level === currentLevel.level) + 1;
    
    if (nextLevelIndex < this.levels.length) {
      return this.levels[nextLevelIndex];
    }
    return null;
  }

  generatePersonalizedChallenges(userStats: any): any[] {
    const challenges = [];
    
    // Dynamic challenges based on user behavior
    if (userStats.carUsage > userStats.ecoTransport) {
      challenges.push({
        title: 'Green Commute Challenge',
        description: 'Use eco-friendly transport 5 times this week',
        target: 5,
        current: 0,
        reward: '100 XP + Transport Master badge',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    if (userStats.meatConsumption > userStats.plantBased) {
      challenges.push({
        title: 'Plant Power Week',
        description: 'Try 3 plant-based meals this week',
        target: 3,
        current: 0,
        reward: '80 XP + Herbivore Hero badge',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Universal challenges
    challenges.push({
      title: 'Daily Consistency',
      description: 'Log at least one activity every day for 7 days',
      target: 7,
      current: userStats.currentStreak,
      reward: '200 XP + Consistency King badge',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    return challenges;
  }

  // Social gamification features
  calculateLeaderboardScore(userStats: any): number {
    const ecoScore = userStats.totalCO2Saved * 10;
    const consistencyScore = userStats.currentStreak * 50;
    const diversityScore = userStats.categoryDiversity * 100; // Bonus for trying different activity types
    
    return ecoScore + consistencyScore + diversityScore;
  }
}

// Usage in components
export const useGamification = () => {
  const engine = new GamificationEngine();
  
  return {
    calculateActivityReward: (activity: any) => {
      const xp = engine.calculateXP(activity);
      const achievements = engine.checkAchievements(activity.user_id, activity.userStats);
      
      return {
        xp,
        achievements,
        message: `+${xp} XP earned!${achievements.length ? ` New achievement(s) unlocked!` : ''}`
      };
    },
    
    getUserProgress: (userStats: any) => {
      const currentLevel = engine.getCurrentLevel(userStats.totalXP);
      const nextLevel = engine.getNextLevel(userStats.totalXP);
      const challenges = engine.generatePersonalizedChallenges(userStats);
      
      return {
        currentLevel,
        nextLevel,
        challenges,
        progress: nextLevel ? 
          ((userStats.totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100 : 100
      };
    }
  };
};