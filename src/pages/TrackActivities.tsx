import { useState, useEffect } from "react";
import { ActivityLogger } from "@/components/ActivityLogger";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  History, 
  Target, 
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Home,
  Calendar,
  Award
} from "lucide-react";

const TrackActivities = () => {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState([]);
  const [todayStats, setTodayStats] = useState({ activities: 0, co2: 0, money: 0 });
  
  const { 
    totalCO2Saved, 
    totalMoneySaved, 
    totalActivities, 
    currentStreak,
    loading 
  } = useUserStats(user?.id || '');

  useEffect(() => {
    if (user?.id) {
      fetchRecentActivities();
      fetchTodayStats();
    }
  }, [user?.id]);

  const fetchRecentActivities = async () => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    setRecentActivities(data || []);
  };

  const fetchTodayStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from('activities')
      .select('co2_impact, financial_impact')
      .eq('user_id', user?.id)
      .gte('created_at', today.toISOString());
    
    if (data) {
      const activities = data.length;
      const co2 = data.reduce((sum, a) => sum + (a.co2_impact || 0), 0);
      const money = data.reduce((sum, a) => sum + (a.financial_impact || 0), 0);
      setTodayStats({ activities, co2, money });
    }
  };

  // Helper function to calculate activity impact
  const calculateImpact = (category: string, activityType: string, amount: number = 1) => {
    const impacts = {
      travel: {
        "Public Transport": { co2: 2.5, cost: 15 },
        "Metro/Train": { co2: 3.2, cost: 20 },
        "Bus Journey": { co2: 2.0, cost: 12 },
        "Cycling": { co2: 8.0, cost: 5 },
        "Walking": { co2: 5.0, cost: 0 }
      },
      food: {
        "Vegetarian Meal": { co2: 4.5, cost: 50 },
        "Home Cooked": { co2: 3.8, cost: 30 },
        "Plant-based": { co2: 6.2, cost: 40 },
        "Local Produce": { co2: 2.1, cost: 25 }
      },
      shopping: {
        "Local Shopping": { co2: 1.5, cost: 20 },
        "Reused Item": { co2: 8.0, cost: 100 },
        "Eco Product": { co2: 3.2, cost: 35 },
        "Second Hand": { co2: 12.0, cost: 150 }
      },
      energy: {
        "LED Lights": { co2: 2.8, cost: 15 },
        "AC Optimized": { co2: 5.5, cost: 80 },
        "Solar Usage": { co2: 8.2, cost: 120 },
        "Energy Saving": { co2: 4.1, cost: 45 }
      }
    };
    
    return impacts[category]?.[activityType] || { co2: 2.0, cost: 10 };
  };

  // Function to log quick activity
  const logQuickActivity = async (action: any) => {
    try {
      const impact = calculateImpact(action.category, action.name);
      
      const { error } = await supabase
        .from('activities')
        .insert([
          {
            user_id: user.id,
            category: action.category,
            activity_type: action.name,
            amount: 1,
            co2_impact: impact.co2,
            financial_impact: impact.cost,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Refresh data
      fetchRecentActivities();
      fetchTodayStats();
      
      // Show success feedback (you could add a toast here)
      console.log(`✅ Logged: ${action.name}`);
      
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Function to use template
  const useTemplate = async (template: any) => {
    try {
      const activities = template.activities.map((activity: any) => {
        const impact = calculateImpact(activity.category, activity.name);
        return {
          user_id: user.id,
          category: activity.category,
          activity_type: activity.name,
          amount: activity.amount || 1,
          co2_impact: impact.co2,
          financial_impact: impact.cost,
          created_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('activities')
        .insert(activities);

      if (error) throw error;

      // Refresh data
      fetchRecentActivities();
      fetchTodayStats();
      
      console.log(`✅ Applied template: ${template.name}`);
      
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const quickActions = [
    { 
      name: "Public Transport", 
      category: "travel", 
      icon: Car, 
      color: "bg-blue-500",
      description: "Bus, Metro, Train ride"
    },
    { 
      name: "Vegetarian Meal", 
      category: "food", 
      icon: Utensils, 
      color: "bg-green-500",
      description: "Plant-based lunch/dinner"
    },
    { 
      name: "Local Shopping", 
      category: "shopping", 
      icon: ShoppingBag, 
      color: "bg-purple-500",
      description: "Support local businesses"
    },
    { 
      name: "LED Lights", 
      category: "energy", 
      icon: Home, 
      color: "bg-orange-500",
      description: "Energy efficient lighting"
    },
    {
      name: "Cycling",
      category: "travel", 
      icon: Car, 
      color: "bg-cyan-500",
      description: "Bike to work/errands"
    },
    {
      name: "Home Cooked",
      category: "food", 
      icon: Utensils, 
      color: "bg-emerald-500",
      description: "Cook instead of ordering"
    },
    {
      name: "Reused Item",
      category: "shopping", 
      icon: ShoppingBag, 
      color: "bg-indigo-500",
      description: "Reuse before buying new"
    },
    {
      name: "AC Optimized",
      category: "energy", 
      icon: Home, 
      color: "bg-amber-500",
      description: "Set AC to 24°C+"
    }
  ];

  const activityTemplates = [
    { 
      name: "Daily Commute", 
      description: "Eco-friendly work commute",
      icon: "🚇",
      activities: [
        { name: "Metro/Train", category: "travel", amount: 2 },
        { name: "Walking", category: "travel", amount: 1 }
      ]
    },
    { 
      name: "Weekend Eco Day", 
      description: "Sustainable weekend activities",
      icon: "🌱",
      activities: [
        { name: "Local Shopping", category: "shopping", amount: 1 },
        { name: "Home Cooked", category: "food", amount: 3 },
        { name: "Walking", category: "travel", amount: 2 }
      ]
    },
    { 
      name: "Work from Home", 
      description: "Home office eco setup",
      icon: "🏠",
      activities: [
        { name: "LED Lights", category: "energy", amount: 1 },
        { name: "AC Optimized", category: "energy", amount: 1 },
        { name: "Home Cooked", category: "food", amount: 2 }
      ]
    },
    {
      name: "Eco Shopping Day",
      description: "Sustainable shopping choices", 
      icon: "🛒",
      activities: [
        { name: "Local Shopping", category: "shopping", amount: 1 },
        { name: "Reused Item", category: "shopping", amount: 1 },
        { name: "Cycling", category: "travel", amount: 1 }
      ]
    }
  ];

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Track Activities</h1>
            <p className="text-muted-foreground">Log, manage, and optimize your eco-friendly journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {currentStreak} day streak
          </Badge>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {loading ? '...' : todayStats.activities}
              </div>
              <div className="text-sm text-blue-700">Activities Today</div>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-900">
                {loading ? '...' : `${todayStats.co2.toFixed(1)}kg`}
              </div>
              <div className="text-sm text-green-700">CO₂ Saved Today</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-900">
                ₹{loading ? '...' : todayStats.money.toFixed(0)}
              </div>
              <div className="text-sm text-orange-700">Saved Today</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">₹</span>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="log">Log Activity</TabsTrigger>
          <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          <TabsTrigger value="history">Recent History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="mt-6">
          <ActivityLogger userId={user.id} onActivityLogged={() => {
            fetchRecentActivities();
            fetchTodayStats();
          }} />
        </TabsContent>
        
        <TabsContent value="quick" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              One-click logging for your most common eco-friendly activities
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => logQuickActivity(action)}
                  className="h-32 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200 hover:shadow-md p-4"
                >
                  <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center shadow-sm`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.name}</span>
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    {action.description}
                  </span>
                </Button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Click any action above to instantly log it with calculated CO₂ and cost savings!
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Recent Activities
            </h3>
            {recentActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activities logged yet. Start tracking to see your history!
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {activity.category?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        -{activity.co2_impact?.toFixed(1)}kg CO₂
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{activity.financial_impact?.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Activity Templates
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Pre-built activity sets for common scenarios. Click to log all activities at once.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activityTemplates.map((template, index) => (
                <Card key={index} className="p-5 hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h4 className="font-semibold text-lg">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Includes:
                    </div>
                    {template.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary/60"></span>
                          <span>{activity.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.amount}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => useTemplate(template)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <p className="text-sm text-muted-foreground">
                🎯 <strong>Templates help you log multiple related activities quickly!</strong> Each template 
                calculates the total impact across all included activities.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackActivities;