// js/progress.js

function displayProgress(dataManager) {
  const weeklyGoals = dataManager.getProfile().weeklyGoals;
  const currentWeekDateStrings = dataManager.getCurrentWeekDateStrings();
  const progressRingsGrid = document.querySelector('.progress-rings-grid');

  if (!progressRingsGrid) {
    console.warn('Progress rings grid not found.');
    return;
  }

  // Clear previous content if any (e.g. old list items if HTML wasn't fully replaced)
  // progressRingsGrid.innerHTML = ''; // Not needed if HTML is static containers

  Object.keys(weeklyGoals).forEach(category => {
    const container = progressRingsGrid.querySelector(`.progress-ring-container[data-category="${category}"]`);
    if (!container) {
      // console.warn(`Container for category ${category} not found.`);
      return; // Skip if no ring container for this goal category
    }

    const goal = weeklyGoals[category];
    const currentProgress = dataManager.getCategoryProgressForWeek(category, currentWeekDateStrings);

    const percentage = goal > 0 ? Math.min(100, (currentProgress / goal) * 100) : 0;

    const ringElement = container.querySelector('.progress-ring__progress');
    const valueElement = container.querySelector('.progress-ring__value');
    // const percentageElement = container.querySelector('.progress-ring__percentage'); // Optional

    if (ringElement) {
      // pathLength is 100, so offset is 100 - percentage
      const offset = 100 - percentage;
      ringElement.style.strokeDashoffset = offset;

      // Creative enhancement: subtle animation on the ring value
      ringElement.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease';
      ringElement.style.filter = 'brightness(1.2)';
      setTimeout(() => {
        if (ringElement) ringElement.style.filter = 'brightness(1)';
      }, 300);
    }

    if (valueElement) {
      let progressText = `${currentProgress.toFixed(0)}/${goal}`;
      if (category === 'skillsHours' || category === 'creativeHours') {
         progressText = `${currentProgress.toFixed(1)}/${goal}h`;
      } else if (category === 'readingPages') {
         progressText = `${currentProgress.toFixed(0)}/${goal}p`;
      }
      valueElement.textContent = progressText;
    }

    // if (percentageElement) { // Optional
    //   percentageElement.textContent = `${percentage.toFixed(0)}%`;
    // }
  });
}

// This function updates data and then calls displayProgress to refresh UI
function updateCategoryProgress(dataManager, category, value) {
    const today = dataManager.getTodayDateString();
    let dailyEntry = dataManager.getDailyEntry(today);

    if (!dailyEntry) {
        dailyEntry = { completed: {} }; // Initialize if no entry for today
    }
    if (!dailyEntry.completed) {
        dailyEntry.completed = {};
    }

    switch (category) {
        case 'jobApps':
            dailyEntry.completed.jobApps = (dailyEntry.completed.jobApps || 0) + value;
            break;
        case 'workout': // value is true/false from quickActions toggle
            dailyEntry.completed.workout = value;
            break;
        case 'readingPages':
            dailyEntry.completed.readingPages = (dailyEntry.completed.readingPages || 0) + value;
            break;
        case 'socialConnection': // value is true/false
            dailyEntry.completed.socialConnection = value;
            break;
        case 'skillsMinutes': // Store as minutes, convert to hours for display/goal
            dailyEntry.completed.skillsMinutes = (dailyEntry.completed.skillsMinutes || 0) + value;
            break;
        case 'creativeMinutes': // Store as minutes
            dailyEntry.completed.creativeMinutes = (dailyEntry.completed.creativeMinutes || 0) + value;
            break;
        default:
            console.warn('Unknown category for progress update:', category);
            return; // Exit if category is unknown
    }

    dataManager.updateDailyEntry(today, { completed: dailyEntry.completed });
    displayProgress(dataManager); // Refresh the entire progress display
}
