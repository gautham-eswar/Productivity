// js/suggestions.js

// --- Main Suggestion Generation Logic ---
function generateDailySuggestions(dataManager, todayDateString) {
  const suggestions = [];
  const userData = dataManager.data; // Assuming direct access to the main data object
  // Ensure 'todayDateString' is in 'YYYY-MM-DD' format
  const today = new Date(todayDateString + 'T00:00:00Z'); // Use Z to denote UTC for date part consistency

  const currentWeekProgress = getCurrentWeekProgress(dataManager); // Uses DataManager's sense of "current week"
  const dayOfWeek = today.getUTCDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday.

  // Default energy if not set (should ideally be set by morning check-in)
  let energyLevel = 6;
  if (userData.daily[todayDateString] && userData.daily[todayDateString].energyPredicted !== undefined) {
    energyLevel = userData.daily[todayDateString].energyPredicted;
  } else {
    // If energyPredicted is not set for today, try to get an initial prediction.
    // This assumes getInitialEnergyPrediction is available and integrated.
    // For now, this part might need to be triggered earlier in the app flow.
    // energyLevel = getInitialEnergyPrediction(userData, todayDateString); // Placeholder if function is elsewhere
  }

  const categories = ['jobApps', 'workouts', 'readingPages', 'skillsHours', 'socialConnections', 'creativeHours'];

  categories.forEach(category => {
    if (!userData.profile.weeklyGoals[category] || userData.profile.weeklyGoals[category] <= 0) {
        return; // Skip if no goal for this category
    }
    const suggestion = calculateCategorySuggestion(category, currentWeekProgress, dayOfWeek, energyLevel, userData, dataManager, todayDateString);
    if (suggestion && suggestion.target > 0) { // Ensure suggestion is valid and target is positive
      suggestions.push(suggestion);
    }
  });

  // Sort by priority (urgency × importance × feasibility)
  // Slice to max 3-4 suggestions as per original spec
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

function calculateCategorySuggestion(category, weekProgress, dayOfWeek, energyLevel, userData, dataManager, todayDateString) {
  // Step 1: Calculate progress urgency
  const weeklyTarget = userData.profile.weeklyGoals[category];
  const currentProgress = weekProgress[category] || 0;

  // daysElapsed: Monday=1, ..., Sunday=7
  // dayOfWeek: Sunday=0, Monday=1, ..., Saturday=6 (from getUTCDay())
  const daysElapsed = dayOfWeek === 0 ? 7 : dayOfWeek;

  const daysRemaining = Math.max(0, 7 - daysElapsed);

  const expectedProgressRatioInWeek = daysElapsed / 7;
  const expectedProgressValue = expectedProgressRatioInWeek * weeklyTarget;

  let progressRatio = 0;
  if (expectedProgressValue > 0) {
    progressRatio = currentProgress / expectedProgressValue;
  } else if (weeklyTarget > 0 && currentProgress >= weeklyTarget) {
    progressRatio = 1.5; // Treat as ahead
  } else if (weeklyTarget > 0 && currentProgress < weeklyTarget && daysElapsed > 0){
    progressRatio = 0.1;
  }


  let urgency = "normal";
  if (progressRatio < 0.4 && weeklyTarget > 0) urgency = "critical";
  else if (progressRatio < 0.7 && weeklyTarget > 0) urgency = "urgent";
  else if (progressRatio > 1.3) urgency = "ahead";

  const remainingNeeded = Math.max(0, weeklyTarget - currentProgress);
  let baseTarget;

  if (urgency === "critical") {
    baseTarget = Math.ceil(remainingNeeded / Math.max(1, daysRemaining > 1 ? daysRemaining -1 : 1));
  } else if (urgency === "urgent") {
    baseTarget = Math.ceil(remainingNeeded / Math.max(1, daysRemaining));
  } else if (urgency === "ahead") {
    baseTarget = daysRemaining > 0 ? Math.floor(remainingNeeded / daysRemaining) : 0;
    baseTarget = Math.max(0, baseTarget);
  } else { // normal
    baseTarget = daysRemaining > 0 ? Math.ceil(remainingNeeded / daysRemaining) : remainingNeeded;
  }

  if (remainingNeeded === 0 && category !== 'workouts' && category !== 'socialConnections') {
      baseTarget = 0;
  }

  const energyMultiplier = getEnergyMultiplier(energyLevel);
  let adjustedTarget = (category === 'workouts' || category === 'socialConnections') ? baseTarget : Math.round(baseTarget * energyMultiplier);
  if (baseTarget > 0 && adjustedTarget <=0 && (category !== 'workouts' && category !== 'socialConnections')) {
      adjustedTarget = 1;
  }

  const finalTarget = applyCategoryRules(category, adjustedTarget, dayOfWeek, weekProgress, userData, dataManager, todayDateString);

  const importanceWeight = getCategoryImportance(category);
  const urgencyScore = getUrgencyScore(urgency);
  const feasibilityScore = getFeasibilityScore(finalTarget, energyLevel, category, weeklyTarget);
  const priority = urgencyScore * importanceWeight * feasibilityScore;

  return {
    category,
    target: finalTarget,
    urgency,
    priority,
    reasoning: generateReasoning(category, finalTarget, urgency, energyLevel, progressRatio, currentProgress, weeklyTarget)
  };
}


// --- Helper Functions ---

function getCurrentWeekProgress(dataManager) {
  const weekDateStrings = dataManager.getCurrentWeekDateStrings(); // Uses DM's current week
  const progress = {};
  const categories = ['jobApps', 'workouts', 'readingPages', 'skillsHours', 'socialConnections', 'creativeHours'];
  categories.forEach(cat => {
    progress[cat] = dataManager.getCategoryProgressForWeek(cat, weekDateStrings);
  });
  return progress;
}

function getEnergyMultiplier(energyLevel) {
  if (energyLevel >= 9) return 1.8;
  if (energyLevel >= 7) return 1.3;
  if (energyLevel >= 5) return 1.0;
  if (energyLevel >= 3) return 0.6;
  return 0.3;
}

function checkYesterdayWorkout(userData, dataManager, todayDateString) {
    const today = new Date(todayDateString + 'T00:00:00Z'); // Use Z for UTC interpretation
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1); // Use setUTCDate
    const yesterdayDateString = yesterday.toISOString().split('T')[0];

    const yesterdayData = userData.daily[yesterdayDateString];
    return yesterdayData && yesterdayData.completed && yesterdayData.completed.workout === true;
}

function applyCategoryRules(category, target, dayOfWeek, weekProgress, userData, dataManager, todayDateString) {
  let finalTarget = target;
  let currentEnergy = 6; // default
  if (userData.daily[todayDateString] && userData.daily[todayDateString].energyPredicted !== undefined) {
    currentEnergy = userData.daily[todayDateString].energyPredicted;
  }


  switch(category) {
    case 'jobApps':
      if (target > 0 && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
        finalTarget = Math.max(1, target);
      } else if (target <= 0 && (dayOfWeek >= 1 && dayOfWeek <= 5) && weekProgress.jobApps < userData.profile.weeklyGoals.jobApps) {
        if (getEnergyMultiplier(currentEnergy) > 0.3) finalTarget = 1;
      }
      break;

    case 'workouts':
      if (target > 0) finalTarget = 1; else finalTarget = 0;
      const yesterdayWorked = checkYesterdayWorkout(userData, dataManager, todayDateString);
      // Recalculate urgency specifically for workout to check if it's critical
      const workoutUrgencyCheck = calculateCategorySuggestion('workouts', weekProgress, dayOfWeek, currentEnergy, userData, dataManager, todayDateString);
      if (finalTarget === 1 && yesterdayWorked && workoutUrgencyCheck.urgency !== 'critical') {
         finalTarget = 0;
      }
      break;

    case 'readingPages':
      if (finalTarget > 0 && finalTarget < 5) finalTarget = 5;
      else if (finalTarget < 0) finalTarget = 0;
      break;

    case 'skillsHours':
      if (finalTarget > 0 && finalTarget < 1) finalTarget = 1;
      else if (finalTarget < 0) finalTarget = 0;
      break;

    case 'socialConnections':
        if (target > 0) finalTarget = 1; else finalTarget = 0;
        break;

    case 'creativeHours':
        if (finalTarget > 0 && finalTarget < 0.5) finalTarget = 0.5;
        else if (finalTarget < 0) finalTarget = 0;
        break;

    default:
      finalTarget = Math.max(0, target);
      break;
  }
  return finalTarget;
}

function getCategoryImportance(category) {
  const weights = {
    jobApps: 1.0,
    workouts: 0.7,
    skillsHours: 0.6,
    readingPages: 0.4,
    socialConnections: 0.3,
    creativeHours: 0.3
  };
  return weights[category] || 0.5;
}

function getUrgencyScore(urgency) {
  switch(urgency) {
    case 'critical': return 1.0;
    case 'urgent': return 0.7;
    case 'normal': return 0.4;
    case 'ahead': return 0.1;
    default: return 0.4;
  }
}

function getFeasibilityScore(finalTarget, energyLevel, category, weeklyTarget) {
  if (finalTarget === 0 && !(category === 'workouts' || category === 'socialConnections' && finalTarget === 0)) return 0.1; // Low if target is 0 unless it's "don't do workout"

  if (category === 'workouts' || category === 'socialConnections') {
    return finalTarget === 1 ? (energyLevel >= 3 ? 0.8 : 0.3) : 0.1; // If target is 0 (don't do), low feasibility score for priority
  }

  let expectedEffort;
  switch(category) {
      case 'jobApps': expectedEffort = finalTarget * 0.3; break;
      case 'readingPages': expectedEffort = finalTarget / 20; break;
      case 'skillsHours': expectedEffort = finalTarget; break;
      case 'creativeHours': expectedEffort = finalTarget; break;
      default: expectedEffort = finalTarget;
  }

  let energyCapacity;
  if (energyLevel <= 2) energyCapacity = 0.5;
  else if (energyLevel <= 4) energyCapacity = 1;
  else if (energyLevel <= 6) energyCapacity = 2;
  else if (energyLevel <= 8) energyCapacity = 3;
  else energyCapacity = 4;

  if (expectedEffort <= energyCapacity * 0.5) return 1.0;
  if (expectedEffort <= energyCapacity) return 0.7;
  if (expectedEffort <= energyCapacity * 1.5) return 0.4;
  return 0.1;
}

function generateReasoning(category, finalTarget, urgency, energyLevel, progressRatio, currentProgress, weeklyTarget) {
  if (finalTarget === 0 && category !== 'workouts' && category !== 'socialConnections') return "Goal likely met or focusing elsewhere.";

  let reason = "";
  if (urgency === "critical") reason += "Critically behind! ";
  else if (urgency === "urgent") reason += "Behind schedule. ";
  else if (urgency === "ahead") reason += "You're ahead! ";
  else reason += "";

  if (energyLevel >= 8) reason += "High energy. ";
  else if (energyLevel >= 5) reason += "Good energy. ";
  else if (energyLevel >= 3) reason += "Energy is a bit low. ";
  else reason += "Low energy, take it easy. ";

  if (urgency !== "ahead" && weeklyTarget > 0) {
      reason += `Aim to catch up on ${category.replace('Hours', ' Hrs').replace('Minutes', ' Mins')}.`;
  } else if (urgency === "ahead") {
      reason += `Great work on ${category.replace('Hours', ' Hrs').replace('Minutes', ' Mins')}!`;
      if (finalTarget > 0) reason += ` Still, consider a small step.`;
      else reason += ` Focus elsewhere if you wish.`;
  } else {
      reason += `Maintain momentum with ${category.replace('Hours', ' Hrs').replace('Minutes', ' Mins')}.`;
  }

  if (category === 'workouts' || category === 'socialConnections') {
      if (finalTarget === 0 && urgency !== "critical") return "Rest day or focus on other areas.";
      if (finalTarget === 1 && urgency === "critical") return "Crucial to get this done today!";
  }

  return reason.trim() || "A good task for today.";
}

function displaySuggestions(dataManager) {
  const suggestionsContainer = document.getElementById('suggestions-container');
  if (!suggestionsContainer) {
    console.error('Suggestions container not found.');
    return;
  }

  const todayDateString = dataManager.getTodayDateString();
  const suggestions = generateDailySuggestions(dataManager, todayDateString);

  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '<p class="no-suggestions-text">No specific suggestions for now. Check back later or focus on your priorities!</p>';
    return;
  }

  let html = '';
  suggestions.forEach(suggestion => {
    let icon = '💡';
    switch (suggestion.category) {
      case 'jobApps': icon = '💼'; break;
      case 'workouts': icon = '💪'; break;
      case 'readingPages': icon = '📖'; break;
      case 'skillsHours': icon = '🛠️'; break;
      case 'socialConnections': icon = '🤝'; break;
      case 'creativeHours': icon = '🎨'; break;
    }

    let urgencyClass = '';
    switch (suggestion.urgency) {
        case 'critical': urgencyClass = 'urgency-critical'; break;
        case 'urgent': urgencyClass = 'urgency-urgent'; break;
        case 'normal': urgencyClass = 'urgency-normal'; break;
        case 'ahead': urgencyClass = 'urgency-ahead'; break;
        default: urgencyClass = 'urgency-normal';
    }

    let targetText = '';
    if (suggestion.category === 'workouts' || suggestion.category === 'socialConnections') {
        targetText = suggestion.target >= 1 ? 'Complete today' : 'Consider resting';
    } else if (suggestion.category === 'skillsHours' || suggestion.category === 'creativeHours') {
        targetText = `Aim for ${suggestion.target.toFixed(1)} hour${suggestion.target !== 1 ? 's' : ''}`;
    } else if (suggestion.category === 'readingPages' || suggestion.category === 'jobApps') {
        targetText = `Target: ${suggestion.target.toFixed(0)}`;
    } else {
        targetText = `Target: ${suggestion.target}`;
    }

    html += `
      <div class="suggestion-card ${urgencyClass}">
        <div class="suggestion-card__icon">${icon}</div>
        <div class="suggestion-card__content">
          <h3 class="suggestion-card__action">${capitalizeFirstLetter(suggestion.category.replace('Hours', ' Hrs').replace('Minutes', ' Mins'))}</h3>
          <p class="suggestion-card__target">${targetText}</p>
          <p class="suggestion-card__reasoning">${suggestion.reasoning}</p>
        </div>
      </div>
    `;
  });

  suggestionsContainer.innerHTML = html;
}

if (typeof capitalizeFirstLetter !== 'function') {
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

function getInitialEnergyPrediction(userData, todayDateString, dataManager) {
  // userData is dataManager.data
  // todayDateString is in "YYYY-MM-DD" format

  const today = new Date(todayDateString + 'T00:00:00Z'); // Use Z for UTC context for date manipulation
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);
  const yesterdayDateString = yesterday.toISOString().split('T')[0];

  // Helper to calculate average energy from the last week (actual energy)
  function getLastWeekEnergyAverage(userData) {
    let totalEnergy = 0;
    let daysWithEnergy = 0;
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date(today);
      pastDate.setUTCDate(today.getUTCDate() - i);
      const pastDateString = pastDate.toISOString().split('T')[0];
      if (userData.daily[pastDateString] && userData.daily[pastDateString].energyActual !== undefined) {
        totalEnergy += userData.daily[pastDateString].energyActual;
        daysWithEnergy++;
      }
    }
    return daysWithEnergy > 0 ? totalEnergy / daysWithEnergy : null;
  }

  // Priority order for initial prediction:
  // 1. If today's energyPredicted is already set by user, use that (handled by caller)
  // 2. If yesterday exists and has actual energy, use that.
  if (userData.daily[yesterdayDateString] && userData.daily[yesterdayDateString].energyActual !== undefined) {
    return userData.daily[yesterdayDateString].energyActual;
  }

  // 3. If user has 7+ days of data (totalDays in profile), use their recent average of *actual* energy.
  const lastWeekAverage = getLastWeekEnergyAverage(userData);
  // The spec says userData.profile.totalDays >= 7. Let's assume totalDays is accurate.
  if (lastWeekAverage !== null && userData.profile && userData.profile.totalDays >= 7) {
    return Math.round(lastWeekAverage);
  }

  // 4. Default to 6.
  return 6;
}
