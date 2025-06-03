class DataManager {
  constructor() {
    this.storageKey = 'productivityTrackerData';
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultData();
    } catch (error) {
      console.error('Failed to load data:', error);
      // In case of parsing error or other issues, return default data
      return this.getDefaultData();
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data:', error);
      // Handle quota exceeded or other storage errors
      // For now, we just log the error. In a real app, might inform the user.
    }
  }

  getDefaultData() {
    return {
      profile: {
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect timezone
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        weeklyGoals: {
          jobApps: 15,
          workouts: 4,
          readingPages: 100,
          socialConnections: 1,
          skillsHours: 6,
          creativeHours: 4
        },
        preferences: {
          theme: "light", // Default to light theme
          notifications: true, // Default to notifications enabled
          insightTone: "encouraging" // Default tone
        }
      },
      daily: {}, // Format: "YYYY-MM-DD": { ... }
      weekly: {}, // Format: "YYYY-WXX": { ... }
      patterns: {
        energyAccuracy: null, // Initialize as null or some starting value
        sequenceEffects: {},
        contextCorrelations: {},
        optimalScheduling: {} // e.g., "morning_person" vs "evening_person"
      }
    };
  }

  // Utility to get today's date string in YYYY-MM-DD format
  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // Example methods to interact with data (can be expanded)
  getProfile() {
    return this.data.profile;
  }

  updateProfile(newProfileData) {
    this.data.profile = { ...this.data.profile, ...newProfileData };
    this.saveData();
  }

  getDailyEntry(dateString) {
    return this.data.daily[dateString];
  }

  updateDailyEntry(dateString, entryData) {
    if (!this.data.daily[dateString]) {
      this.data.daily[dateString] = {};
    }
    this.data.daily[dateString] = { ...this.data.daily[dateString], ...entryData, timestamp: Date.now() };
    // If it's a new day entry, increment totalDays
    if (Object.keys(this.data.daily[dateString]).length === Object.keys(entryData).length) { // A bit simplistic check for new day
        this.data.profile.totalDays = (this.data.profile.totalDays || 0) + 1;
    }
    this.saveData();
  }

  getWeeklyData(weekString) { // e.g., "2025-W23"
    return this.data.weekly[weekString];
  }

  updateWeeklyData(weekString, data) {
    this.data.weekly[weekString] = { ...this.data.weekly[weekString], ...data };
    this.saveData();
  }

  getPatterns() {
    return this.data.patterns;
  }

  updatePatterns(newPatterns) {
    this.data.patterns = { ...this.data.patterns, ...newPatterns};
    this.saveData();
  }
}
