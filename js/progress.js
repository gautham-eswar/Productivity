// This script will be responsible for displaying progress.

function displayProgress(dataManager) {
  const progressContainer = document.getElementById('progress-items');
  if (!progressContainer) return;

  const today = dataManager.getTodayDateString();
  const dailyData = dataManager.getDailyEntry(today);
  const weeklyGoals = dataManager.getProfile().weeklyGoals;

  let html = '<ul>';

  for (const category in weeklyGoals) {
    if (weeklyGoals.hasOwnProperty(category)) {
      const goal = weeklyGoals[category];
      let currentProgress = 0;

      if (dailyData && dailyData.completed) {
        switch (category) {
          case 'jobApps':
            currentProgress = dailyData.completed.jobApps || 0;
            break;
          case 'workouts':
            // For weekly count, we'd need to sum up daily 'workout: true' flags.
            // For MVP daily, it's just a boolean. We'll show daily status for now.
            currentProgress = dailyData.completed.workout ? 1 : 0;
            // To show weekly sum, this logic would need to iterate over the week's daily entries.
            // That's more complex than MVP daily display, so sticking to daily for now.
            break;
          case 'readingPages':
            currentProgress = dailyData.completed.readingPages || 0;
            break;
          case 'socialConnections':
            currentProgress = dailyData.completed.socialConnection ? 1 : 0; // Similar to workouts
            break;
          case 'skillsHours':
            // weeklyGoals.skillsHours is in hours, completed.skillsMinutes is in minutes
            currentProgress = (dailyData.completed.skillsMinutes || 0) / 60;
            break;
          case 'creativeHours':
            currentProgress = (dailyData.completed.creativeMinutes || 0) / 60;
            break;
          default:
            currentProgress = 0;
        }
      }

      // For weekly goals like workouts/socialConnections, the goal is a count.
      // For MVP, we're showing daily completion (0 or 1 for boolean flags).
      // A more advanced view would sum these up for the week.
      let unit = '';
      if (category === 'readingPages') unit = ' pages';
      else if (category === 'skillsHours' || category === 'creativeHours') unit = ' hrs';
      else if (category === 'jobApps') unit = ' apps';


      html += `<li>
        <strong>${capitalizeFirstLetter(category.replace('Hours', ' Hrs').replace('Minutes', ' Mins'))}:</strong>
        ${currentProgress.toFixed(1)}${unit} / ${goal}${unit} (Goal)
      </li>`;
    }
  }
  html += '</ul>';
  progressContainer.innerHTML = html;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Example of how to update a specific category (will be called from elsewhere)
function updateCategoryProgress(dataManager, category, value) {
    const today = dataManager.getTodayDateString();
    let dailyEntry = dataManager.getDailyEntry(today);

    if (!dailyEntry) { // Ensure there's an entry for today
        dataManager.updateDailyEntry(today, { completed: {} }); // Create a basic one if not
        dailyEntry = dataManager.getDailyEntry(today); // Re-fetch
    }

    if (!dailyEntry.completed) {
        dailyEntry.completed = {};
    }

    switch (category) {
        case 'jobApps':
            dailyEntry.completed.jobApps = (dailyEntry.completed.jobApps || 0) + value;
            break;
        case 'workout': // This is a boolean in spec, so value is true/false or 1/0
            dailyEntry.completed.workout = !!value;
            break;
        case 'readingPages':
            dailyEntry.completed.readingPages = (dailyEntry.completed.readingPages || 0) + value;
            break;
        case 'socialConnection': // Boolean
            dailyEntry.completed.socialConnection = !!value;
            break;
        case 'skillsMinutes':
            dailyEntry.completed.skillsMinutes = (dailyEntry.completed.skillsMinutes || 0) + value;
            break;
        case 'creativeMinutes':
            dailyEntry.completed.creativeMinutes = (dailyEntry.completed.creativeMinutes || 0) + value;
            break;
        default:
            console.warn('Unknown category for progress update:', category);
            return;
    }
    dataManager.updateDailyEntry(today, { completed: dailyEntry.completed });
    displayProgress(dataManager); // Refresh the display
}

// The actual call to displayProgress will be in app.js on load and after updates.
// For example:
// document.addEventListener('DOMContentLoaded', () => {
//   const dataManager = new DataManager(); // This instance should come from app.js
//   displayProgress(dataManager);
// });
