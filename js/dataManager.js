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

  // Helper to get ISO week number for a date
  getISOWeek(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Get current week's date strings (Mon to Sun) in "YYYY-MM-DD" format
  getCurrentWeekDateStrings() {
      const today = new Date();
      const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust Sunday to be end of week

      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          weekDates.push(day.toISOString().split('T')[0]);
      }
      return weekDates;
  }

  // Get current week string e.g. "2024-W23"
  getCurrentWeekISOString() {
      const today = new Date();
      const year = today.getFullYear();
      const weekNumber = this.getISOWeek(today);
      return `${year}-W${String(weekNumber).padStart(2, '0')}`;
  }


  // Calculate total for a category over the given week dates
  getCategoryProgressForWeek(category, weekDateStrings) {
      let weeklyTotal = 0;
      weekDateStrings.forEach(dateStr => {
          const dailyEntry = this.data.daily[dateStr];
          if (dailyEntry && dailyEntry.completed) {
              switch (category) {
                  case 'jobApps':
                      weeklyTotal += (dailyEntry.completed.jobApps || 0);
                      break;
                  case 'workouts':
                      if (dailyEntry.completed.workout) weeklyTotal++;
                      break;
                  case 'readingPages':
                      weeklyTotal += (dailyEntry.completed.readingPages || 0);
                      break;
                  case 'socialConnections':
                      if (dailyEntry.completed.socialConnection) weeklyTotal++;
                      break;
                  case 'skillsHours':
                      weeklyTotal += ((dailyEntry.completed.skillsMinutes || 0) / 60);
                      break;
                  case 'creativeHours':
                      weeklyTotal += ((dailyEntry.completed.creativeMinutes || 0) / 60);
                      break;
                  default:
                      break;
              }
          }
      });
      return weeklyTotal;
  }
}
