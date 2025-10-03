// AI Response Validation and Enhancement Layer

export interface EnhancedSuggestion {
  title: string;
  description: string;
  ecoImpact: string;
  financialSaving: string;
  category: 'high' | 'medium' | 'low';
  confidence: number;
  sources: string[];
  actionSteps: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export const validateAndEnhanceSuggestions = (
  suggestions: any[], 
  userActivities: any[]
): EnhancedSuggestion[] => {
  return suggestions
    .filter(isValidSuggestion)
    .map(suggestion => enhanceSuggestion(suggestion, userActivities))
    .sort((a, b) => b.confidence - a.confidence);
};

const isValidSuggestion = (suggestion: any): boolean => {
  const requiredFields = ['title', 'description', 'ecoImpact', 'financialSaving', 'category'];
  const hasAllFields = requiredFields.every(field => suggestion[field]);
  
  const hasReasonableNumbers = 
    extractNumber(suggestion.ecoImpact) > 0 && 
    extractNumber(suggestion.financialSaving) > 0;
  
  const isRelevant = suggestion.title.length > 10 && suggestion.description.length > 20;
  
  return hasAllFields && hasReasonableNumbers && isRelevant;
};

const enhanceSuggestion = (suggestion: any, userActivities: any[]): EnhancedSuggestion => {
  const confidence = calculateConfidence(suggestion, userActivities);
  const actionSteps = generateActionSteps(suggestion);
  const difficulty = assessDifficulty(suggestion);
  const sources = addScientificSources(suggestion);

  return {
    ...suggestion,
    confidence,
    actionSteps,
    difficulty,
    sources
  };
};

const calculateConfidence = (suggestion: any, activities: any[]): number => {
  let confidence = 0.5; // Base confidence
  
  // Check if suggestion is based on user's actual activities
  const relevantActivities = activities.filter(activity => 
    suggestion.description.toLowerCase().includes(activity.category) ||
    suggestion.description.toLowerCase().includes(activity.activity_type.toLowerCase())
  );
  
  confidence += relevantActivities.length * 0.1; // +10% per relevant activity
  
  // Check for specific, actionable advice
  if (suggestion.description.includes('Replace') || 
      suggestion.description.includes('Switch to') ||
      suggestion.description.includes('Use')) {
    confidence += 0.2;
  }
  
  // Check for realistic numbers
  const ecoNumber = extractNumber(suggestion.ecoImpact);
  const financeNumber = extractNumber(suggestion.financialSaving);
  
  if (ecoNumber < 50 && financeNumber < 5000) { // Reasonable ranges
    confidence += 0.2;
  }
  
  return Math.min(0.95, confidence); // Cap at 95%
};

const extractNumber = (text: string): number => {
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const generateActionSteps = (suggestion: any): string[] => {
  // AI-generated action steps based on suggestion type
  const steps = [];
  
  if (suggestion.title.toLowerCase().includes('transport')) {
    steps.push('Research public transport routes in your area');
    steps.push('Download transport apps for real-time schedules');
    steps.push('Calculate potential monthly savings');
    steps.push('Start with 2-3 trips per week');
  } else if (suggestion.title.toLowerCase().includes('food')) {
    steps.push('Find local vegetarian/vegan restaurants');
    steps.push('Plan 3 plant-based meals this week');
    steps.push('Learn 2 new eco-friendly recipes');
    steps.push('Track your food-related emissions');
  } else {
    steps.push('Research the suggested alternative');
    steps.push('Calculate potential savings');
    steps.push('Start with small changes');
    steps.push('Track your progress weekly');
  }
  
  return steps;
};

const assessDifficulty = (suggestion: any): 'easy' | 'moderate' | 'challenging' => {
  const title = suggestion.title.toLowerCase();
  const description = suggestion.description.toLowerCase();
  
  if (title.includes('switch') || title.includes('use') || description.includes('replace')) {
    return 'easy';
  } else if (title.includes('reduce') || description.includes('gradually')) {
    return 'moderate';
  } else {
    return 'challenging';
  }
};

const addScientificSources = (suggestion: any): string[] => {
  // Add credible sources based on suggestion type
  const sources = ['IPCC Climate Reports', 'Environmental Protection Agency'];
  
  if (suggestion.title.toLowerCase().includes('transport')) {
    sources.push('International Energy Agency Transport Report');
  }
  if (suggestion.title.toLowerCase().includes('food')) {
    sources.push('FAO Livestock Environmental Assessment');
  }
  
  return sources;
};