// This script will be expanded in app.js to interact with DataManager
// For now, it's a placeholder for future event listeners and functions.

function setupDailyCheckinEventListeners(dataManager) {
  const saveButton = document.getElementById('save-checkin');
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const today = dataManager.getTodayDateString();
          // const energyPredicted = parseInt(document.getElementById('energy-predicted').value, 10); // Removed: Handled by energySlider.js
      const mood = "neutral"; // Placeholder for mood selection
      // const sleepHours = parseFloat(document.getElementById('sleep-hours').value); // Removed: Handled by sleepInputs.js
      // const sleepQuality = parseInt(document.getElementById('sleep-quality').value, 10); // Removed: Handled by sleepInputs.js

      // Basic context tag handling (split by comma, trim whitespace)
      // For MVP, we're not strictly enforcing the predefined list or custom tag limit yet.
      // const contextTagsRaw = document.getElementById('context-tags').value; // Removed: Handled by contextTags.js
      // const contextTags = contextTagsRaw ? contextTagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag) : []; // Removed: Handled by contextTags.js

      const intention = document.getElementById('intention').value;

      // if (isNaN(energyPredicted) || isNaN(sleepHours) || isNaN(sleepQuality)) { // energyPredicted removed from check
      // if (isNaN(sleepHours) || isNaN(sleepQuality)) { // sleepHours and sleepQuality also removed
      //   alert('Please fill in all numeric fields for sleep hours and quality in the morning check-in.');
      //   return;
      // }
      // No specific numeric fields left to check in this function directly, other fields are text or handled by components

      const dailyData = {
        // energyPredicted, // Removed: Handled by energySlider.js
        mood, // Will need UI for this later
        // sleepHours, // Removed: Handled by sleepInputs.js
        // sleepQuality, // Removed: Handled by sleepInputs.js
        // contextTags, // Removed: Handled by contextTags.js
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
  const dayTypeCards = document.querySelectorAll('.day-type-card');
  let selectedDayType = null;

  // Load initial day type if available
  const today = dataManager.getTodayDateString();
  const dailyData = dataManager.getDailyEntry(today);
  if (dailyData && dailyData.dayType) {
    selectedDayType = dailyData.dayType;
    dayTypeCards.forEach(card => {
      if (card.dataset.value === selectedDayType) {
        card.classList.add('selected');
      }
    });
  }

  // Emoji mapping
  const EMOJIS = {
      green: '🥳',
      yellow: '🤔',
      red: '😫'
  };

  dayTypeCards.forEach(card => {
    // Set initial emoji from JS
    const emojiSpan = card.querySelector('.day-type-emoji');
    if (emojiSpan && EMOJIS[card.dataset.value]) {
        emojiSpan.textContent = EMOJIS[card.dataset.value];
    }

    card.addEventListener('click', () => {
      dayTypeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedDayType = card.dataset.value;
      // Optional: Save selection immediately or wait for "Save Reflection" button
      // For now, we'll save when "Save Reflection" is clicked.
    });
  });

  if (saveReflectionButton) {
    saveReflectionButton.addEventListener('click', () => {
      // const today = dataManager.getTodayDateString(); // Already defined above
      const existingDailyData = dataManager.getDailyEntry(today) || {};

      // Actual energy is handled by its own slider component
      const reflection = document.getElementById('reflection').value;

      // Day type is now from 'selectedDayType' variable
      if (!selectedDayType) {
        alert('Please select a day type (Green, Yellow, or Red).');
        return;
      }

      const reflectionData = {
        ...existingDailyData,
        dayType: selectedDayType,
        reflection
      };

      dataManager.updateDailyEntry(today, reflectionData);
          if (typeof displayMiniCalendar === 'function') {
            displayMiniCalendar('mini-calendar-widget', dataManager);
          } else {
            console.warn('displayMiniCalendar function not found, cannot refresh calendar.');
          }
          alert('End of day reflection saved!'); // Keep alert after potential refresh
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
