// Environmental Context Integration

export interface EnvironmentalContext {
  airQuality: {
    aqi: number;
    category: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
    recommendations: string[];
  };
  weather: {
    temperature: number;
    humidity: number;
    conditions: string;
    walkingFriendly: boolean;
    cyclingFriendly: boolean;
  };
  transportation: {
    trafficLevel: 'Low' | 'Moderate' | 'High';
    publicTransportDelay: number; // minutes
    recommendedMode: string[];
  };
}

// Helper functions
const getTrafficLevel = (congestion: number): 'Low' | 'Moderate' | 'High' => {
  if (congestion < 30) return 'Low';
  if (congestion < 70) return 'Moderate';
  return 'High';
};

const isWalkingFriendly = (weather: any): boolean => {
  return weather.temperature > 15 && weather.temperature < 35 && 
         weather.humidity < 80 && !weather.conditions.includes('rain');
};

const isCyclingFriendly = (weather: any, aqi: number): boolean => {
  return weather.temperature > 10 && weather.temperature < 32 && 
         aqi < 150 && !weather.conditions.includes('rain');
};

const getRecommendedTransport = (weather: any, aqi: number, congestion: number): string[] => {
  const modes: string[] = [];
  
  if (isWalkingFriendly(weather)) modes.push('Walking');
  if (isCyclingFriendly(weather, aqi)) modes.push('Cycling');
  if (congestion < 50) modes.push('Car');
  modes.push('Public Transport'); // Always available
  
  return modes;
};

const getAQICategory = (aqi: number): 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  return 'Severe';
};

const getAirQualityRecommendations = (aqi: number): string[] => {
  if (aqi <= 50) return ['Great air quality! Perfect for outdoor activities.'];
  if (aqi <= 100) return ['Moderate air quality. Outdoor activities are generally acceptable.'];
  if (aqi <= 200) return ['Poor air quality. Consider limiting outdoor activities.'];
  if (aqi <= 300) return ['Very poor air quality. Avoid outdoor activities if possible.'];
  return ['Severe air quality. Stay indoors and use air purifiers.'];
};

export const getEnvironmentalContext = async (location: string): Promise<EnvironmentalContext> => {
  try {
    const [airQuality, weather, traffic] = await Promise.all([
      getAirQualityData(location),
      getWeatherData(location),
      getTrafficData(location)
    ]);

    return {
      airQuality: {
        aqi: airQuality.aqi,
        category: getAQICategory(airQuality.aqi),
        recommendations: getAirQualityRecommendations(airQuality.aqi)
      },
      weather: {
        temperature: weather.temp,
        humidity: weather.humidity,
        conditions: weather.condition,
        walkingFriendly: isWalkingFriendly(weather),
        cyclingFriendly: isCyclingFriendly(weather, airQuality.aqi)
      },
      transportation: {
        trafficLevel: getTrafficLevel(parseFloat(traffic.congestion) || 50),
        publicTransportDelay: traffic.delay,
        recommendedMode: getRecommendedTransport(weather, airQuality.aqi, parseFloat(traffic.congestion) || 50)
      }
    };
  } catch (error) {
    console.error('Failed to fetch environmental context:', error);
    return getDefaultContext();
  }
};

const getAirQualityData = async (location: string) => {
  // Mock data for now - in production, integrate with actual API
  return {
    aqi: Math.floor(Math.random() * 200) + 50, // AQI between 50-250
    pollutants: {
      pm2_5: Math.random() * 100,
      pm10: Math.random() * 150,
      o3: Math.random() * 200
    }
  };
};

const getWeatherData = async (location: string) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`
  );
  const data = await response.json();
  
  return {
    temp: data.main.temp,
    humidity: data.main.humidity,
    condition: data.weather[0].main,
    windSpeed: data.wind.speed
  };
};

const getTrafficData = async (location: string) => {
  // Mock implementation - in reality, integrate with Google Maps Traffic API
  return {
    congestion: Math.random() > 0.5 ? 'High' : 'Moderate',
    delay: Math.floor(Math.random() * 20), // minutes
    incidents: []
  };
};

// Duplicate functions removed - using the ones defined above

const getDefaultContext = (): EnvironmentalContext => ({
  airQuality: {
    aqi: 100,
    category: 'Moderate',
    recommendations: ['Check air quality before outdoor activities']
  },
  weather: {
    temperature: 25,
    humidity: 60,
    conditions: 'Clear',
    walkingFriendly: true,
    cyclingFriendly: true
  },
  transportation: {
    trafficLevel: 'Moderate',
    publicTransportDelay: 5,
    recommendedMode: ['Public Transport', 'Cycling']
  }
});

// Enhanced suggestion generation with environmental context
export const generateContextualSuggestions = (
  activities: any[], 
  environmentalContext: EnvironmentalContext
): any[] => {
  const suggestions = [];
  
  // Air quality-based suggestions
  if (environmentalContext.airQuality.aqi > 150) {
    suggestions.push({
      title: 'Switch to Metro/AC Transport Today',
      description: `Air quality is ${environmentalContext.airQuality.category} (AQI: ${environmentalContext.airQuality.aqi}). Avoid walking/cycling and use enclosed transport.`,
      ecoImpact: 'Protect your health',
      financialSaving: 'Health cost savings',
      category: 'high',
      contextual: true
    });
  }
  
  // Weather-based suggestions
  if (environmentalContext.weather.walkingFriendly && environmentalContext.airQuality.aqi < 100) {
    suggestions.push({
      title: 'Perfect Weather for Walking!',
      description: `Great conditions today (${environmentalContext.weather.temperature}°C, ${environmentalContext.weather.conditions}). Consider walking for short trips.`,
      ecoImpact: '0kg CO₂ emissions',
      financialSaving: '₹0 transport cost',
      category: 'medium',
      contextual: true
    });
  }
  
  // Traffic-based suggestions
  if (environmentalContext.transportation.trafficLevel === 'High') {
    suggestions.push({
      title: 'Avoid Traffic - Work from Home',
      description: `Heavy traffic expected today. Consider working from home or using metro to avoid ₹${50 * 2} in fuel and 2+ hours in traffic.`,
      ecoImpact: '8.4kg CO₂ saved',
      financialSaving: '₹100+ saved',
      category: 'high',
      contextual: true
    });
  }
  
  return suggestions;
};