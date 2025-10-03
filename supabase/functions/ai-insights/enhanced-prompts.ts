// Enhanced AI Prompts for Better Accuracy

export const createContextualPrompt = (activities: any[], userProfile: any) => {
  const activityPatterns = analyzeUserPatterns(activities);
  
  return `You are an expert sustainability coach with deep knowledge of Indian market conditions and environmental impact.

USER CONTEXT:
- Location: ${userProfile.location || 'India'}
- Activity Pattern: ${activityPatterns.summary}
- Primary Transport: ${activityPatterns.mainTransport}
- Diet Preference: ${activityPatterns.dietType}
- Spending Level: ${activityPatterns.spendingTier}

RECENT ACTIVITIES ANALYSIS:
${activities.map(a => `${a.category}: ${a.activity_type} (${a.amount} ${getUnitType(a.category)}) - Impact: ${a.co2_impact}kg CO₂, Cost: ₹${a.financial_impact}`).join('\n')}

INSTRUCTIONS:
1. Analyze patterns and identify top 3 improvement opportunities
2. Provide India-specific alternatives with real market prices
3. Calculate accurate CO₂ savings based on scientific data
4. Include behavioral psychology tips for habit formation
5. Prioritize suggestions by impact vs. effort ratio

OUTPUT FORMAT: Return exactly 3 suggestions with accurate Indian market data.`;
};

// Helper functions
const getActivitySummary = (activities: any[]) => {
  return `${activities.length} activities logged, primary categories: ${activities.map(a => a.category).join(', ')}`;
};

const getMostUsedTransport = (transportModes: any[]) => {
  if (transportModes.length === 0) return 'Mixed';
  const counts = transportModes.reduce((acc, t) => {
    acc[t.activityType] = (acc[t.activityType] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

const getDietPattern = (foodChoices: any[]) => {
  if (foodChoices.length === 0) return 'Mixed';
  const hasVeg = foodChoices.some(f => ['Vegetables', 'Fruits', 'Lentils'].includes(f.activityType));
  const hasMeat = foodChoices.some(f => ['Chicken', 'Mutton', 'Fish'].includes(f.activityType));
  if (hasVeg && !hasMeat) return 'Vegetarian';
  if (hasMeat) return 'Non-Vegetarian';
  return 'Mixed';
};

const calculateSpendingTier = (activities: any[]) => {
  const totalSpent = activities.reduce((sum, a) => sum + (a.financialImpact || 0), 0);
  if (totalSpent < 500) return 'Budget-conscious';
  if (totalSpent < 2000) return 'Moderate spender';
  return 'Premium lifestyle';
};

const analyzeUserPatterns = (activities: any[]) => {
  const transportModes = activities.filter(a => a.category === 'travel');
  const foodChoices = activities.filter(a => a.category === 'food');
  
  return {
    summary: getActivitySummary(activities),
    mainTransport: getMostUsedTransport(transportModes),
    dietType: getDietPattern(foodChoices),
    spendingTier: calculateSpendingTier(activities)
  };
};

const getUnitType = (category: string) => {
  const units: { [key: string]: string } = {
    travel: 'km',
    food: 'meals',
    shopping: 'items',
    energy: 'kWh'
  };
  return units[category] || 'units';
};