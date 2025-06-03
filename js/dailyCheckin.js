// This script will be expanded in app.js to interact with DataManager
// For now, it's a placeholder for future event listeners and functions.

function setupDailyCheckinEventListeners(dataManager) {
  const saveButton = document.getElementById('save-checkin');
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const today = dataManager.getTodayDateString();
      const energyPredicted = parseInt(document.getElementById('energy-predicted').value, 10);
      const mood = "neutral"; // Placeholder for mood selection
      const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
      const sleepQuality = parseInt(document.getElementById('sleep-quality').value, 10);

      // Basic context tag handling (split by comma, trim whitespace)
      // For MVP, we're not strictly enforcing the predefined list or custom tag limit yet.
      const contextTagsRaw = document.getElementById('context-tags').value;
      const contextTags = contextTagsRaw ? contextTagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

      const intention = document.getElementById('intention').value;

      if (isNaN(energyPredicted) || isNaN(sleepHours) || isNaN(sleepQuality)) {
        alert('Please fill in all numeric fields for the morning check-in.');
        return;
      }

      const dailyData = {
        energyPredicted,
        mood, // Will need UI for this later
        sleepHours,
        sleepQuality,
        contextTags,
        intention,
        // completed, timeSpent, energyActual, dayType, reflection, suggestions will be added later
        completed: {
          jobApps: 0,
          workout: false,
          readingPages: 0,
          socialConnection: false,
          skillsMinutes: 0,
          creativeMinutes: 0
        },
        timeSpent: {},
        suggestions: [] // Placeholder
      };

      dataManager.updateDailyEntry(today, dailyData);
      alert('Morning check-in saved!');
      // Potentially clear form or give other feedback
    });
  }
}

// The actual call to setupDailyCheckinEventListeners will be in app.js
// For example:
// document.addEventListener('DOMContentLoaded', () => {
//   const dataManager = new DataManager(); // This instance should come from app.js
//   setupDailyCheckinEventListeners(dataManager);
// });

function setupReflectionEventListeners(dataManager) {
  const saveReflectionButton = document.getElementById('save-reflection');
  if (saveReflectionButton) {
    saveReflectionButton.addEventListener('click', () => {
      const today = dataManager.getTodayDateString();
      const existingDailyData = dataManager.getDailyEntry(today) || {}; // Get existing or empty object

      const energyActual = parseInt(document.getElementById('energy-actual').value, 10);
      const reflection = document.getElementById('reflection').value;

      let dayType = null;
      const selectedDayTypeElement = document.querySelector('input[name="day-type-selection"]:checked');
      if (selectedDayTypeElement) {
        dayType = selectedDayTypeElement.value;
      }

      if (isNaN(energyActual)) {
        alert('Please enter your actual energy level.');
        return;
      }
      if (!dayType) {
        alert('Please select a day type (Green, Yellow, or Red).');
        return;
      }

      // Merge with existing data for the day
      const reflectionData = {
        ...existingDailyData, // Preserve morning check-in and completed tasks
        energyActual,
        dayType,
        reflection
      };

      dataManager.updateDailyEntry(today, reflectionData);
      alert('End of day reflection saved!');
    });
  }
}

// Ensure both event listener setups are available.
// The actual calls will be in app.js
// The actual call to setupDailyCheckinEventListeners and setupReflectionEventListeners will be in app.js
// For example:
// document.addEventListener('DOMContentLoaded', () => {
//   const dataManager = new DataManager(); // This instance should come from app.js
//   setupDailyCheckinEventListeners(dataManager);
//   setupReflectionEventListeners(dataManager);
// });
