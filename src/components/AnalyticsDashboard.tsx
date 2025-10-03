import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarDays, TrendingDown, TrendingUp, Leaf, DollarSign, Target, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsDashboardProps {
  userId: string;
}

export const AnalyticsDashboard = ({ userId }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const daysBack = parseInt(timeRange.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (activities) {
        setAnalyticsData(processAnalyticsData(activities, daysBack));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (activities: any[], days: number) => {
    // Time series data for trends
    const timeSeriesData = generateTimeSeriesData(activities, days);
    
    // Category breakdown
    const categoryData = generateCategoryBreakdown(activities);
    
    // Impact metrics
    const impactMetrics = calculateImpactMetrics(activities);
    
    // Predictions and goals
    const predictions = generatePredictions(activities, days);
    
    // Comparative analysis
    const comparisons = generateComparisons(activities);

    return {
      timeSeries: timeSeriesData,
      categories: categoryData,
      impact: impactMetrics,
      predictions,
      comparisons
    };
  };

  const generateTimeSeriesData = (activities: any[], days: number) => {
    const dailyData = new Map();
    
    // Initialize all days with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      dailyData.set(dateKey, {
        date: dateKey,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        co2Impact: 0,
        financialImpact: 0,
        activities: 0
      });
    }

    // Aggregate actual activity data
    activities.forEach(activity => {
      const dateKey = activity.created_at.split('T')[0];
      if (dailyData.has(dateKey)) {
        const dayData = dailyData.get(dateKey);
        dayData.co2Impact += activity.co2_impact;
        dayData.financialImpact += activity.financial_impact;
        dayData.activities += 1;
      }
    });

    return Array.from(dailyData.values()).reverse();
  };

  const generateCategoryBreakdown = (activities: any[]) => {
    const categories = ['travel', 'food', 'shopping', 'energy'];
    const categoryStats = categories.map(category => {
      const categoryActivities = activities.filter(a => a.category === category);
      const totalCO2 = categoryActivities.reduce((sum, a) => sum + a.co2_impact, 0);
      const totalCost = categoryActivities.reduce((sum, a) => sum + a.financial_impact, 0);
      const count = categoryActivities.length;

      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        co2Impact: totalCO2,
        financialImpact: totalCost,
        activities: count,
        avgCO2: count > 0 ? totalCO2 / count : 0,
        avgCost: count > 0 ? totalCost / count : 0
      };
    });

    return categoryStats;
  };

  const calculateImpactMetrics = (activities: any[]) => {
    const totalCO2 = activities.reduce((sum, a) => sum + a.co2_impact, 0);
    const totalCost = activities.reduce((sum, a) => sum + a.financial_impact, 0);
    
    // Calculate equivalent metrics for context
    const treesEquivalent = totalCO2 / 21.8; // Average tree absorbs 21.8kg CO2/year
    const milesEquivalent = totalCO2 / 0.404; // Average car emits 0.404kg CO2/mile
    const monthlyBudgetImpact = (totalCost / activities.length) * 30; // Monthly projection

    // Environmental achievements
    const achievements = {
      carbonNeutralDays: activities.filter(a => a.co2_impact <= 0).length,
      topEcoChoices: getTopEcoChoices(activities),
      improvementAreas: getImprovementAreas(activities)
    };

    return {
      totalCO2,
      totalCost,
      treesEquivalent,
      milesEquivalent,
      monthlyBudgetImpact,
      achievements
    };
  };

  const generatePredictions = (activities: any[], days: number) => {
    if (activities.length < 7) return null; // Need at least a week of data

    const recentActivities = activities.slice(-7); // Last 7 days
    const avgDailyCO2 = recentActivities.reduce((sum, a) => sum + a.co2_impact, 0) / 7;
    const avgDailyCost = recentActivities.reduce((sum, a) => sum + a.financial_impact, 0) / 7;

    return {
      monthlyProjection: {
        co2Impact: avgDailyCO2 * 30,
        financialImpact: avgDailyCost * 30
      },
      yearlyProjection: {
        co2Impact: avgDailyCO2 * 365,
        financialImpact: avgDailyCost * 365
      },
      goals: {
        co2Reduction: avgDailyCO2 * 30 * 0.2, // 20% reduction goal
        costSaving: avgDailyCost * 30 * 0.15   // 15% cost saving goal
      }
    };
  };

  const generateComparisons = (activities: any[]) => {
    // Compare to average Indian carbon footprint (1.9 tons CO2/year)
    const userAnnualCO2 = (activities.reduce((sum, a) => sum + a.co2_impact, 0) / activities.length) * 365;
    const avgIndianCO2 = 1900; // kg CO2/year
    
    return {
      vsNationalAverage: {
        user: userAnnualCO2,
        national: avgIndianCO2,
        percentageDiff: ((userAnnualCO2 - avgIndianCO2) / avgIndianCO2) * 100
      },
      improvements: calculatePotentialImprovements(activities)
    };
  };

  const getTopEcoChoices = (activities: any[]) => {
    return activities
      .filter(a => a.co2_impact < 1.0) // Low carbon activities
      .slice(0, 3)
      .map(a => ({
        activity: `${a.activity_type} (${a.category})`,
        impact: a.co2_impact,
        saving: a.financial_impact
      }));
  };

  const getImprovementAreas = (activities: any[]) => {
    const highImpactActivities = activities
      .filter(a => a.co2_impact > 5.0)
      .slice(0, 3);

    return highImpactActivities.map(a => ({
      activity: `${a.activity_type} (${a.category})`,
      impact: a.co2_impact,
      suggestion: generateImprovementSuggestion(a)
    }));
  };

  const calculatePotentialImprovements = (activities: any[]) => {
    const carTrips = activities.filter(a => a.activity_type === 'Car');
    const meatMeals = activities.filter(a => a.activity_type === 'Meat');
    
    return {
      transportSwitch: {
        current: carTrips.length,
        potential: carTrips.reduce((sum, a) => sum + (a.co2_impact * 0.7), 0), // 70% reduction
        suggestion: "Switch to public transport or cycling"
      },
      dietaryChange: {
        current: meatMeals.length,
        potential: meatMeals.reduce((sum, a) => sum + (a.co2_impact * 0.6), 0), // 60% reduction
        suggestion: "Try plant-based meals 2-3 times per week"
      }
    };
  };

  const generateImprovementSuggestion = (activity: any) => {
    const suggestions = {
      'Car': 'Try cycling or public transport for shorter distances',
      'Meat': 'Consider plant-based alternatives 2-3 times per week',
      'New Clothes': 'Explore second-hand or sustainable fashion options',
      'Electricity': 'Switch to LED bulbs and energy-efficient appliances'
    };
    
    return suggestions[activity.activity_type] || 'Consider eco-friendly alternatives';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Start logging activities to see your analytics!</p>
        </div>
      </Card>
    );
  }

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">CO₂ Impact</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analyticsData.impact.totalCO2.toFixed(1)} kg
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ≈ {analyticsData.impact.treesEquivalent.toFixed(1)} trees
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Financial Impact</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₹{analyticsData.impact.totalCost.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ≈ ₹{analyticsData.impact.monthlyBudgetImpact.toFixed(0)}/month
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">Activities</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analyticsData.timeSeries.reduce((sum: number, day: any) => sum + day.activities, 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analyticsData.impact.achievements.carbonNeutralDays} carbon-neutral days
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">vs National Avg</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analyticsData.comparisons.vsNationalAverage.percentageDiff > 0 ? '+' : ''}
            {analyticsData.comparisons.vsNationalAverage.percentageDiff.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analyticsData.comparisons.vsNationalAverage.percentageDiff < 0 ? 'Below' : 'Above'} average
          </p>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="co2Impact" 
                  stackId="1" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.3}
                  name="CO₂ Impact (kg)"
                />
                <Area 
                  type="monotone" 
                  dataKey="activities" 
                  stackId="2" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Daily Activities"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">CO₂ Impact by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="co2Impact"
                  >
                    {analyticsData.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#3b82f6" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          {analyticsData.predictions && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Projections</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700">CO₂ Impact</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {analyticsData.predictions.monthlyProjection.co2Impact.toFixed(1)} kg
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Financial Impact</span>
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      ₹{analyticsData.predictions.monthlyProjection.financialImpact.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Improvement Goals</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">CO₂ Reduction Target</h4>
                    <div className="text-xl font-bold text-green-600">
                      -{analyticsData.predictions.goals.co2Reduction.toFixed(1)} kg
                    </div>
                    <p className="text-sm text-muted-foreground">20% monthly reduction goal</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Cost Saving Target</h4>
                    <div className="text-xl font-bold text-blue-600">
                      ₹{analyticsData.predictions.goals.costSaving.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">15% monthly saving goal</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Eco Choices</h3>
              <div className="space-y-3">
                {analyticsData.impact.achievements.topEcoChoices.map((choice: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">{choice.activity}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-800">
                        {choice.impact.toFixed(1)} kg CO₂
                      </div>
                      <div className="text-xs text-green-600">
                        ₹{choice.saving.toFixed(0)} saved
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Improvement Opportunities</h3>
              <div className="space-y-3">
                {analyticsData.impact.achievements.improvementAreas.map((area: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{area.activity}</span>
                      <span className="text-sm font-bold text-red-600">
                        {area.impact.toFixed(1)} kg CO₂
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{area.suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};