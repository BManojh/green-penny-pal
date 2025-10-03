// Smart Notification System
import { useState, useEffect } from 'react';

export class NotificationManager {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    // Request notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async schedulePersonalizedReminders(userId: string, userPreferences: any) {
    if (this.permission !== 'granted' || !this.registration) return;

    // Clear existing reminders
    await this.clearScheduledNotifications();

    const reminders = this.generatePersonalizedReminders(userPreferences);
    
    for (const reminder of reminders) {
      await this.scheduleNotification(reminder);
    }
  }

  private generatePersonalizedReminders(preferences: any) {
    const reminders = [];
    const now = new Date();

    // Daily activity reminder
    if (preferences.dailyReminder) {
      const reminderTime = new Date(now);
      reminderTime.setHours(preferences.reminderHour || 19, 0, 0, 0); // Default 7 PM
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      reminders.push({
        id: 'daily-activity',
        title: 'Track Your Green Journey! 🌱',
        body: 'Log today\'s eco-activities and see your impact!',
        scheduledTime: reminderTime,
        data: { type: 'daily-reminder' }
      });
    }

    // Weekly progress summary
    if (preferences.weeklyProgress) {
      const weeklyTime = new Date(now);
      weeklyTime.setDate(weeklyTime.getDate() + (7 - weeklyTime.getDay())); // Next Sunday
      weeklyTime.setHours(10, 0, 0, 0); // 10 AM

      reminders.push({
        id: 'weekly-progress',
        title: 'Weekly Green Report Ready! 📊',
        body: 'Check out your environmental impact and achievements',
        scheduledTime: weeklyTime,
        data: { type: 'weekly-summary' }
      });
    }

    // Contextual reminders based on user behavior
    const contextualReminders = this.generateContextualReminders(preferences);
    reminders.push(...contextualReminders);

    return reminders;
  }

  private generateContextualReminders(preferences: any) {
    const reminders = [];
    const now = new Date();

    // Transportation reminder for commute times
    if (preferences.transportReminders && preferences.commuteTime) {
      const morningCommute = new Date(now);
      morningCommute.setHours(preferences.commuteTime.morning || 8, 0, 0, 0);
      
      if (morningCommute <= now) {
        morningCommute.setDate(morningCommute.getDate() + 1);
      }

      reminders.push({
        id: 'morning-transport',
        title: 'Green Commute Time! 🚲',
        body: 'Consider cycling or public transport for your morning commute',
        scheduledTime: morningCommute,
        data: { type: 'transport-reminder', time: 'morning' }
      });
    }

    // Meal planning reminder
    if (preferences.mealReminders) {
      const mealPlanningTime = new Date(now);
      mealPlanningTime.setHours(18, 0, 0, 0); // 6 PM
      
      if (mealPlanningTime <= now) {
        mealPlanningTime.setDate(mealPlanningTime.getDate() + 1);
      }

      reminders.push({
        id: 'meal-planning',
        title: 'Plan Tomorrow\'s Meals! 🥬',
        body: 'Consider adding a plant-based option to reduce your carbon footprint',
        scheduledTime: mealPlanningTime,
        data: { type: 'meal-reminder' }
      });
    }

    // Achievement celebration
    if (preferences.achievementNotifications) {
      // This would be triggered when achievements are unlocked
      reminders.push({
        id: 'achievement-celebration',
        title: 'New Achievement Unlocked! 🏆',
        body: 'You\'ve reached a new milestone in your eco journey!',
        scheduledTime: now, // Immediate
        data: { type: 'achievement' }
      });
    }

    return reminders;
  }

  async scheduleNotification(reminder: any) {
    if (!this.registration) return;

    const delay = reminder.scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      // Send immediately
      await this.sendNotification(reminder);
    } else {
      // Schedule for later
      setTimeout(async () => {
        await this.sendNotification(reminder);
      }, delay);
    }
  }

  protected async sendNotification(notification: any) {
    if (this.permission !== 'granted') return;

    const options = {
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: notification.data,
      requireInteraction: false,
      silent: false,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/action-open.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/action-dismiss.png'
        }
      ]
    };

    if (this.registration) {
      await this.registration.showNotification(notification.title, options);
    } else {
      // Fallback to basic notification
      new Notification(notification.title, options);
    }
  }

  async clearScheduledNotifications() {
    if (!this.registration) return;

    const notifications = await this.registration.getNotifications();
    notifications.forEach(notification => notification.close());
  }

  // Smart reminder adjustments based on user behavior
  async adjustRemindersBasedOnBehavior(userId: string, activityPattern: any) {
    const preferences = await this.getUserPreferences(userId);
    
    // If user is very active, reduce reminder frequency
    if (activityPattern.dailyActivities > 5) {
      preferences.reminderFrequency = 'low';
    }
    
    // If user hasn't logged activities in 3 days, increase reminders
    if (activityPattern.daysSinceLastActivity > 3) {
      preferences.reminderFrequency = 'high';
      await this.sendMotivationalNotification();
    }
    
    // Adjust timing based on when user is most active
    const mostActiveHour = activityPattern.peakActivityHour;
    if (mostActiveHour) {
      preferences.reminderHour = mostActiveHour - 1; // Remind 1 hour before peak time
    }
    
    await this.saveUserPreferences(userId, preferences);
    await this.schedulePersonalizedReminders(userId, preferences);
  }

  private async sendMotivationalNotification() {
    const motivationalMessages = [
      'Your planet needs you! 🌍 Log your eco-activities and make a difference!',
      'Every small action counts! 💚 Track your green choices today!',
      'You\'re making a difference! 🌱 Continue your eco journey!',
      'The Earth is counting on you! 🌿 Log your sustainable activities!'
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    await this.sendNotification({
      title: 'Keep Going, Eco Warrior!',
      body: randomMessage,
      data: { type: 'motivation' }
    });
  }

  private async getUserPreferences(userId: string) {
    // In a real app, fetch from database
    return {
      dailyReminder: true,
      weeklyProgress: true,
      transportReminders: true,
      mealReminders: true,
      achievementNotifications: true,
      reminderHour: 19,
      reminderFrequency: 'medium',
      commuteTime: { morning: 8, evening: 18 }
    };
  }

  private async saveUserPreferences(userId: string, preferences: any) {
    // In a real app, save to database
    localStorage.setItem(`preferences_${userId}`, JSON.stringify(preferences));
  }
}

// Environmental context-aware notifications
export class EnvironmentalNotificationManager extends NotificationManager {
  async sendWeatherBasedReminder(weatherData: any, airQuality: any) {
    if (weatherData.temperature > 15 && weatherData.temperature < 30 && 
        airQuality.aqi < 100 && weatherData.condition !== 'Rain') {
      
      await this.sendNotification({
        title: 'Perfect Weather for Green Transport! 🌤️',
        body: `Great weather today (${weatherData.temperature}°C). Consider walking or cycling!`,
        data: { 
          type: 'weather-opportunity',
          weather: weatherData,
          airQuality: airQuality
        }
      });
    }

    if (airQuality.aqi > 150) {
      await this.sendNotification({
        title: 'Air Quality Alert! ⚠️',
        body: `Poor air quality (AQI: ${airQuality.aqi}). Use enclosed transport today.`,
        data: { 
          type: 'air-quality-warning',
          aqi: airQuality.aqi
        }
      });
    }
  }

  async sendTrafficBasedReminder(trafficLevel: string) {
    if (trafficLevel === 'High') {
      await this.sendNotification({
        title: 'Heavy Traffic Alert! 🚗',
        body: 'Consider working from home or using metro to save time and reduce emissions.',
        data: { 
          type: 'traffic-alert',
          level: trafficLevel
        }
      });
    }
  }
}

// Usage in React component
export const useNotifications = () => {
  const [notificationManager] = useState(() => new EnvironmentalNotificationManager());

  useEffect(() => {
    notificationManager.initialize();
  }, [notificationManager]);

  return {
    scheduleReminders: (userId: string, preferences: any) => 
      notificationManager.schedulePersonalizedReminders(userId, preferences),
    
    sendWeatherReminder: (weather: any, airQuality: any) =>
      notificationManager.sendWeatherBasedReminder(weather, airQuality),
    
    adjustReminders: (userId: string, pattern: any) =>
      notificationManager.adjustRemindersBasedOnBehavior(userId, pattern)
  };
};