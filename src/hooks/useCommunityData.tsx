import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfaces for community data types
export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  eco_score: number;
  level: number;
  co2_saved: number;
  streak_days: number;
  badges: any[];
  created_at: string;
  updated_at: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  current_progress: number;
  reward: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by?: string;
  participants?: number;
  user_joined?: boolean;
  user_progress?: number;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'general' | 'achievement' | 'activity';
  achievement_data?: any;
  activity_data?: any;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user_profile?: UserProfile;
  user_liked?: boolean;
  comments?: PostComment[];
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description?: string;
  achievement_icon?: string;
  earned_at: string;
}

interface CommunityStats {
  posts: CommunityPost[];
  challenges: CommunityChallenge[];
  leaderboard: UserProfile[];
  userProfile: UserProfile | null;
  userStats: {
    globalRank: number;
    localRank: number;
    challengesJoined: number;
    challengesCompleted: number;
    friendsCount: number;
    impactShared: number;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Store demo posts in memory for the session
let demoPosts: CommunityPost[] = [];

export const useCommunityData = (userId: string): CommunityStats => {
  const [stats, setStats] = useState<CommunityStats>({
    posts: [],
    challenges: [],
    leaderboard: [],
    userProfile: null,
    userStats: {
      globalRank: 0,
      localRank: 0,
      challengesJoined: 0,
      challengesCompleted: 0,
      friendsCount: 0,
      impactShared: 0
    },
    loading: true,
    error: null,
    refresh: async () => {}
  });

  const fetchCommunityData = useCallback(async () => {
    if (!userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Try to fetch real data from database first
      try {
        // Fetch posts from database
        const { data: postsData, error: postsError } = await supabase
          .from('community_posts')
          .select(`
            *,
            user_profiles!inner(*)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (postsError) throw postsError;

        // Fetch challenges from database
        const { data: challengesData, error: challengesError } = await supabase
          .from('community_challenges')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (challengesError) throw challengesError;

        // Fetch leaderboard from database
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('eco_score', { ascending: false })
          .limit(10);

        if (leaderboardError) throw leaderboardError;

        // Use database data
        setStats({
          posts: (postsData || []) as unknown as CommunityPost[],
          challenges: (challengesData || []) as unknown as CommunityChallenge[],
          leaderboard: (leaderboardData || []) as unknown as UserProfile[],
          userProfile: (leaderboardData?.find(u => u.id === userId) || null) as unknown as UserProfile | null,
          userStats: {
            globalRank: 0,
            localRank: 0,
            challengesJoined: 0,
            challengesCompleted: 0,
            friendsCount: 0,
            impactShared: 0
          },
          loading: false,
          error: null,
          refresh: fetchCommunityData
        });

      } catch (dbError) {
        console.warn('Database fetch failed, falling back to mock data:', dbError);
        
        // Fall back to mock data if database fails
        const mockData = getMockCommunityData(userId);
        
        // Combine mock posts with any demo posts created in this session
        const allPosts = [...demoPosts, ...mockData.posts];
        
        setStats({
          ...mockData,
          posts: allPosts,
          loading: false,
          error: null,
          refresh: fetchCommunityData
        });
      }
      
    } catch (error) {
      console.error('Error fetching community data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [userId]);

  const getMockCommunityData = (userId: string) => {
    const mockUserProfile: UserProfile = {
      id: userId,
      username: "You",
      display_name: "Your Display Name",
      avatar_url: "/avatars/current-user.png",
      bio: "Eco-conscious user making a difference!",
      eco_score: 1890,
      level: 6,
      co2_saved: 78.9,
      streak_days: 12,
      badges: ["🌱 Rising Star"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockLeaderboard: UserProfile[] = [
      {
        id: "1",
        username: "EcoChampion_Mumbai",
        display_name: "Eco Champion Mumbai",
        avatar_url: "/avatars/user1.png",
        eco_score: 2450,
        level: 8,
        co2_saved: 125.5,
        streak_days: 23,
        badges: ["🌟 Eco Master"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "2", 
        username: "GreenWarrior_Delhi",
        display_name: "Green Warrior Delhi",
        avatar_url: "/avatars/user2.png",
        eco_score: 2320,
        level: 7,
        co2_saved: 98.2,
        streak_days: 18,
        badges: ["🚲 Transport Hero"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      mockUserProfile
    ];

    const mockChallenges: CommunityChallenge[] = [
      {
        id: "1",
        title: "Plant-Based January",
        description: "Community goal: 1000 plant-based meals this month",
        category: "Food",
        goal: 1000,
        current_progress: 687,
        reward: "Tree Planting Certificate + 500 XP",
        start_date: new Date('2025-01-01').toISOString(),
        end_date: new Date('2025-01-31').toISOString(),
        is_active: true,
        participants: 156,
        user_joined: false,
        user_progress: 0
      },
      {
        id: "2",
        title: "Car-Free Week Challenge",
        description: "Avoid using cars for one week. Use eco-friendly transport!",
        category: "Transport",
        goal: 500,
        current_progress: 342,
        reward: "Cycling Champion Badge + 300 XP",
        start_date: new Date('2025-10-01').toISOString(),
        end_date: new Date('2025-10-15').toISOString(),
        is_active: true,
        participants: 89,
        user_joined: true,
        user_progress: 65
      },
      {
        id: "3",
        title: "Zero Waste Weekend",
        description: "Minimize waste generation and choose reusable alternatives",
        category: "Lifestyle",
        goal: 200,
        current_progress: 78,
        reward: "Waste Warrior Badge + 200 XP",
        start_date: new Date('2025-10-05').toISOString(),
        end_date: new Date('2025-10-07').toISOString(),
        is_active: true,
        participants: 45,
        user_joined: false,
        user_progress: 0
      }
    ];

    const mockPosts: CommunityPost[] = [
      {
        id: "1",
        user_id: "1",
        content: "Just completed my 30-day cycling streak! 🚲 Saved 15kg CO₂ and ₹450 this month!",
        post_type: "achievement",
        achievement_data: { title: "Cycling Master", icon: "🚴‍♀️" },
        likes_count: 24,
        comments_count: 8,
        is_public: true,
        created_at: new Date('2025-10-02').toISOString(),
        updated_at: new Date('2025-10-02').toISOString(),
        user_profile: mockLeaderboard[0],
        user_liked: false
      },
      {
        id: "2",
        user_id: "2",
        content: "Switched to solar power for my home! Initial investment but huge long-term savings 💡",
        post_type: "activity",
        activity_data: { type: "Solar Power", impact: "8.5kg CO₂ saved" },
        likes_count: 18,
        comments_count: 5,
        is_public: true,
        created_at: new Date('2025-10-01').toISOString(),
        updated_at: new Date('2025-10-01').toISOString(),
        user_profile: mockLeaderboard[1],
        user_liked: true
      },
      {
        id: "3",
        user_id: "3",
        content: "Week 4 of my plant-based journey! Feeling healthier and helping the planet 🌱",
        post_type: "general",
        likes_count: 31,
        comments_count: 12,
        is_public: true,
        created_at: new Date('2025-09-30').toISOString(),
        updated_at: new Date('2025-09-30').toISOString(),
        user_profile: {
          id: "3",
          username: "PlantBasedPro",
          display_name: "Plant Based Pro",
          avatar_url: "/avatars/user3.png",
          eco_score: 1650,
          level: 5,
          co2_saved: 55.2,
          streak_days: 28,
          badges: ["🌱 Plant Pioneer"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        user_liked: false
      }
    ];

    return {
      posts: mockPosts,
      challenges: mockChallenges,
      leaderboard: mockLeaderboard,
      userProfile: mockUserProfile,
      userStats: {
        globalRank: 1247,
        localRank: 23,
        challengesJoined: 5,
        challengesCompleted: 2,
        friendsCount: 12,
        impactShared: 8
      }
    };
  };



  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  return {
    ...stats,
    refresh: fetchCommunityData
  };
};

// Helper functions for CRUD operations

export const createPost = async (postData: {
  user_id: string;
  content: string;
  post_type?: 'general' | 'achievement' | 'activity';
  achievement_data?: any;
  activity_data?: any;
  image_url?: string;
}): Promise<boolean> => {
  try {
    // Check if community tables exist by trying to query them
    const { error: tableCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.warn('Community tables not found, creating demo post:', tableCheckError.message);
      
      // Create a demo post that will appear in the UI
      const demoPost: CommunityPost = {
        id: `demo-${Date.now()}`,
        user_id: postData.user_id,
        content: postData.content,
        post_type: postData.post_type || 'general',
        achievement_data: postData.achievement_data,
        activity_data: postData.activity_data,
        image_url: postData.image_url,
        likes_count: 0,
        comments_count: 0,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profile: {
          id: postData.user_id,
          username: "You",
          display_name: "You",
          avatar_url: "/avatars/current-user.png",
          eco_score: 0,
          level: 1,
          co2_saved: 0,
          streak_days: 0,
          badges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        user_liked: false
      };
      
      // Add to demo posts array (at the beginning to show newest first)
      demoPosts.unshift(demoPost);
      
      return true; // Return true to indicate successful creation
    }

    // First ensure the user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', postData.user_id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: postData.user_id,
          username: `User${postData.user_id.slice(0, 8)}`,
          display_name: `User${postData.user_id.slice(0, 8)}`,
          eco_score: 0,
          co2_saved: 0,
          activities_completed: 0
        }]);
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }
    }

    // Now create the post
    const { error } = await supabase
      .from('community_posts')
      .insert([postData]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating post:', error);
    return false;
  }
};

export const likePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    // Check if this is a demo post
    const demoPost = demoPosts.find(p => p.id === postId);
    if (demoPost) {
      demoPost.user_liked = true;
      demoPost.likes_count += 1;
      return true;
    }

    // Try database operation
    const { error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
};

export const unlikePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    // Check if this is a demo post
    const demoPost = demoPosts.find(p => p.id === postId);
    if (demoPost) {
      demoPost.user_liked = false;
      demoPost.likes_count = Math.max(0, demoPost.likes_count - 1);
      return true;
    }

    // Try database operation
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    return false;
  }
};

export const addComment = async (commentData: {
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('post_comments')
      .insert([commentData]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

export const joinChallenge = async (challengeId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('challenge_participants')
      .insert([{ challenge_id: challengeId, user_id: userId }]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error joining challenge:', error);
    return false;
  }
};

export const updateChallengeProgress = async (
  challengeId: string, 
  userId: string, 
  progress: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('challenge_participants')
      .update({ 
        progress,
        completed_at: progress >= 100 ? new Date().toISOString() : null
      })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return false;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const addUserAchievement = async (achievementData: {
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description?: string;
  achievement_icon?: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_achievements')
      .insert([achievementData]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding achievement:', error);
    return false;
  }
};