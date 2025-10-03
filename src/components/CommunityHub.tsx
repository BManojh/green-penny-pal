import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Share2, Heart, MessageCircle, Target, Globe, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommunityData, createPost, likePost, unlikePost, joinChallenge, updateChallengeProgress } from "@/hooks/useCommunityData";

interface CommunityHubProps {
  userId: string;
}

export const CommunityHub = ({ userId }: CommunityHubProps) => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [newPostContent, setNewPostContent] = useState("");
  const { toast } = useToast();

  // Use the dynamic community data hook
  const {
    posts: socialFeed,
    challenges,
    leaderboard,
    userProfile,
    userStats,
    loading,
    error,
    refresh
  } = useCommunityData(userId);



  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const success = await joinChallenge(challengeId, userId);
      if (success) {
        toast({
          title: "Challenge Joined!",
          description: "You're now part of this community challenge. Good luck!",
        });
        refresh(); // Refresh the data
      } else {
        throw new Error('Failed to join challenge');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareAchievement = async (achievement: any) => {
    try {
      const success = await createPost({
        user_id: userId,
        content: `Just unlocked: ${achievement.title}! 🎉`,
        post_type: 'achievement',
        achievement_data: achievement
      });
      
      if (success) {
        refresh(); // Refresh data to show new post
        toast({
          title: "Achievement Shared!",
          description: "Your achievement has been shared with the community!",
        });
      } else {
        throw new Error('Failed to share achievement');
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to share achievement.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      console.log('Creating post with userId:', userId);
      console.log('Post content:', newPostContent);
      
      const success = await createPost({
        user_id: userId,
        content: newPostContent,
        post_type: 'general'
      });
      
      console.log('Create post result:', success);
      
      if (success) {
        setNewPostContent("");
        refresh(); // Refresh data to show new post
        toast({
          title: "Post Created!",
          description: "Your post has been shared with the community!",
        });
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('handleCreatePost error:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    const post = socialFeed.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        await unlikePost(postId, userId);
      } else {
        await likePost(postId, userId);
      }
      // Refresh the data to show updated like status
      refresh();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Stats Header */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Community Hub
          </h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Global Rank #{userStats?.globalRank || "Loading..."}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userStats?.localRank || 0}</div>
            <div className="text-sm text-muted-foreground">Local Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{userStats?.challengesCompleted || 0}</div>
            <div className="text-sm text-muted-foreground">Challenges Won</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{userStats?.friendsCount || 0}</div>
            <div className="text-sm text-muted-foreground">Eco Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{userStats?.impactShared || 0}</div>
            <div className="text-sm text-muted-foreground">Achievements Shared</div>
          </div>
        </div>
      </Card>

      {/* Main Community Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="h-4 w-4 mr-2" />
            Social Feed
          </TabsTrigger>
          <TabsTrigger value="impact">
            <Globe className="h-4 w-4 mr-2" />
            Global Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Eco Champions</h3>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-lg ${
                  entry.id === userId ? 'bg-primary/10 border-2 border-primary/20' : 'bg-accent/5'
                }`}>
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  
                  <Avatar>
                    <AvatarImage src={entry.avatar_url || '/avatars/default.png'} />
                    <AvatarFallback>{(entry.display_name || entry.username).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{entry.display_name || entry.username}</h4>
                      <Badge variant="outline">{entry.badges[0] || '🌱 Eco Warrior'}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {entry.level} • {entry.co2_saved}kg CO₂ saved • {entry.streak_days} day streak
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{entry.eco_score.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Eco Points</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-6">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                  </div>
                  <Badge variant="secondary">{challenge.category}</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {challenge.current_progress}/{challenge.goal}</span>
                    <span>{Math.round((challenge.current_progress / challenge.goal) * 100)}%</span>
                  </div>
                  <Progress value={(challenge.current_progress / challenge.goal) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants || 0} participants
                      </span>
                      <span>Ends: {new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                    <Button 
                      onClick={() => handleJoinChallenge(challenge.id)} 
                      size="sm"
                      disabled={challenge.user_joined}
                    >
                      {challenge.user_joined ? 'Joined' : 'Join Challenge'}
                    </Button>
                  </div>
                  
                  <div className="text-sm">
                    <strong>Reward:</strong> {challenge.reward}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <div className="space-y-6">
            {/* Create Post */}
            <Card className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Share your eco journey..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Feed */}
            {socialFeed.map(post => (
              <Card key={post.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.user_profile?.avatar_url} />
                    <AvatarFallback>{post.user_profile?.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{post.user_profile?.username}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground">{post.content}</p>
                    </div>
                    
                    {post.achievement_data && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          <span className="font-medium text-yellow-800">
                            Achievement: {post.achievement_data.title || 'Achievement unlocked!'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {post.activity_data && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800">{post.activity_data.type || 'Eco Activity'}</span>
                          <span className="text-sm text-green-600">{post.activity_data.co2_saved || post.activity_data.impact || 'Positive impact!'}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={post.user_liked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                        {post.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments_count}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Collective Global Impact
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Total CO₂ Reduced</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-800">2,847 tons</div>
                  <div className="text-xs text-green-600">By 15,432 community members</div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Money Saved</span>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-800">₹8.2 Cr</div>
                  <div className="text-xs text-blue-600">Community total savings</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">This Month's Achievements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 1,234 car trips replaced with eco transport</li>
                    <li>• 5,678 plant-based meals chosen</li>
                    <li>• 890 energy-efficient upgrades made</li>
                    <li>• 456 second-hand purchases over new</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Environmental Equivalents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>🌳 130,540 trees planted equivalent</li>
                    <li>🏠 5,694 homes powered for a year</li>
                    <li>🚗 7.1M km of car travel avoided</li>
                    <li>💧 2.3M liters of water saved</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};