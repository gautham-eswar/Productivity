// js/suggestions.js

function generateSimpleSuggestions(dataManager) {
  // For MVP, this is very simplified.
  // It does not use most of the complex logic from the spec yet.
  const suggestions = [];
  const profile = dataManager.getProfile();
  const today = dataManager.getTodayDateString();
  const dailyEntry = dataManager.getDailyEntry(today);

  let energyLevel = 6; // Default
  if (dailyEntry && dailyEntry.energyPredicted) {
    energyLevel = dailyEntry.energyPredicted;
  }

  // Suggestion 1: Job Applications (if goal is set)
  if (profile.weeklyGoals.jobApps > 0) {
    suggestions.push({
      category: 'jobApps',
      target: Math.max(1, Math.ceil(profile.weeklyGoals.jobApps / 5)), // Simple daily target
      urgency: 'normal',
      reasoning: `Aim for about ${Math.max(1, Math.ceil(profile.weeklyGoals.jobApps / 5))} job applications today.`
    });
  }

  // Suggestion 2: Workout (if goal is set and energy is decent)
  if (profile.weeklyGoals.workouts > 0 && energyLevel >= 5) {
    suggestions.push({
      category: 'workouts',
      target: 1, // Suggest 1 workout
      urgency: 'normal',
      reasoning: 'Feeling energetic? Consider a workout session.'
    });
  } else if (profile.weeklyGoals.workouts > 0) {
     suggestions.push({
      category: 'workouts',
      target: 1,
      urgency: 'low',
      reasoning: 'Consider a light activity or workout if you feel up to it.'
    });
  }

  // Suggestion 3: Reading
  if (profile.weeklyGoals.readingPages > 0) {
    suggestions.push({
      category: 'readingPages',
      target: Math.max(10, Math.ceil(profile.weeklyGoals.readingPages / 7)),
      urgency: 'normal',
      reasoning: `Read around ${Math.max(10, Math.ceil(profile.weeklyGoals.readingPages / 7))} pages.`
    });
  }

  // Suggestion 4: Skills (if energy allows)
  if (profile.weeklyGoals.skillsHours > 0 && energyLevel >= 6) {
      suggestions.push({
          category: 'skillsHours',
          target: 1, // Suggest 1 hour
          urgency: 'normal',
          reasoning: 'Good energy for focusing on skills development for an hour.'
      });
  }


  // Return a limited number of suggestions, e.g., top 3
  return suggestions.slice(0, 3);
}

function displaySuggestions(dataManager) {
  const suggestionsContainer = document.getElementById('suggestions-container');
  if (!suggestionsContainer) return;

  const suggestions = generateSimpleSuggestions(dataManager);

  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '<p>No specific suggestions for now. Focus on your priorities!</p>';
    return;
  }

  let html = '<ul>';
  suggestions.forEach(suggestion => {
    html += `
          <li>
            <strong>${capitalizeFirstLetter(suggestion.category)}:</strong>
            Target ${suggestion.target}
            <em>(${suggestion.reasoning})</em>
          </li>`;
  });
  html += '</ul>';

  suggestionsContainer.innerHTML = html;
}

// Helper (can be moved to a utility file later)
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// The actual call to displaySuggestions will be in app.js
