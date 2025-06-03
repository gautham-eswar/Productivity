// js/app.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize DataManager
  const dataManager = new DataManager();
  console.log("DataManager initialized. Current data:", dataManager.data);

  // Setup Event Listeners from other modules
  // Note: Ensure the functions are globally accessible or refactor for module pattern if preferred later.
  // For this MVP, we assume functions like setupDailyCheckinEventListeners are available globally
  // because they are simple function declarations in their respective files.

  if (typeof setupDailyCheckinEventListeners === 'function') {
    setupDailyCheckinEventListeners(dataManager);
  } else {
    console.error('setupDailyCheckinEventListeners is not defined. Check js/dailyCheckin.js');
  }

  if (typeof setupReflectionEventListeners === 'function') {
    setupReflectionEventListeners(dataManager);
  } else {
    console.error('setupReflectionEventListeners is not defined. Check js/dailyCheckin.js');
  }

  // Initial Display Updates
  if (typeof displayProgress === 'function') {
    displayProgress(dataManager);
  } else {
    console.error('displayProgress is not defined. Check js/progress.js');
  }

  if (typeof displaySuggestions === 'function') {
    displaySuggestions(dataManager);
  } else {
    console.error('displaySuggestions is not defined. Check js/suggestions.js');
  }

  // --- UI Population for Check-in and Reflection ---
  // Populate existing daily data if available for today
  loadCurrentDayData(dataManager);


  // --- Example of how to use updateCategoryProgress from other parts of the app ---
  // This is just a placeholder for where you might hook up task completion buttons
  // For example, if you had a button to mark "1 job app done":
  // document.getElementById('complete-job-app-btn')?.addEventListener('click', () => {
  //   if (typeof updateCategoryProgress === 'function') {
  //      // For MVP, let's add some interactive elements to test progress updates
  //      // This would typically be part of the task items themselves
  //      updateCategoryProgress(dataManager, 'jobApps', 1);
  //      alert('1 Job App marked as completed! Progress display updated.');
  //   } else {
  //      console.error('updateCategoryProgress is not defined. Check js/progress.js');
  //   }
  // });

  // Add some example interactive elements to test progress updates more easily
  addProgressTestButtons(dataManager);

});

function loadCurrentDayData(dataManager) {
    const today = dataManager.getTodayDateString();
    const dailyData = dataManager.getDailyEntry(today);

    if (dailyData) {
        // Morning Check-in
        if (dailyData.energyPredicted) document.getElementById('energy-predicted').value = dailyData.energyPredicted;
        if (dailyData.sleepHours) document.getElementById('sleep-hours').value = dailyData.sleepHours;
        if (dailyData.sleepQuality) document.getElementById('sleep-quality').value = dailyData.sleepQuality;
        if (dailyData.contextTags) document.getElementById('context-tags').value = dailyData.contextTags.join(', ');
        if (dailyData.intention) document.getElementById('intention').value = dailyData.intention;

        // End of Day Reflection
        if (dailyData.energyActual) document.getElementById('energy-actual').value = dailyData.energyActual;
        if (dailyData.reflection) document.getElementById('reflection').value = dailyData.reflection;
        if (dailyData.dayType) {
            const dayTypeElement = document.querySelector(`input[name="day-type-selection"][value="${dailyData.dayType}"]`);
            if (dayTypeElement) dayTypeElement.checked = true;
        }
    }
}

function addProgressTestButtons(dataManager) {
    const progressSection = document.getElementById('progress-display');
    if (!progressSection || typeof updateCategoryProgress !== 'function') return;

    const testButtonsContainer = document.createElement('div');
    testButtonsContainer.style.marginTop = '1rem';
    testButtonsContainer.innerHTML = '<h4>Test Progress Updates:</h4>';

    const categoriesToTest = [
        { name: 'Job App (+1)', category: 'jobApps', value: 1 },
        { name: 'Workout (Toggle)', category: 'workout', value: null }, // Special handling for boolean
        { name: 'Read Pages (+10)', category: 'readingPages', value: 10 },
        { name: 'Social Connection (Toggle)', category: 'socialConnection', value: null }, // Special
        { name: 'Skills Minutes (+30)', category: 'skillsMinutes', value: 30 },
        { name: 'Creative Minutes (+30)', category: 'creativeMinutes', value: 30 }
    ];

    categoriesToTest.forEach(item => {
        const button = document.createElement('button');
        button.textContent = item.name;
        button.style.margin = '5px';
        button.addEventListener('click', () => {
            const today = dataManager.getTodayDateString();
            let currentValue;
            if (item.category === 'workout' || item.category === 'socialConnection') {
                const dailyData = dataManager.getDailyEntry(today);
                currentValue = dailyData && dailyData.completed ? !dailyData.completed[item.category] : true;
                 updateCategoryProgress(dataManager, item.category, currentValue);
            } else {
                updateCategoryProgress(dataManager, item.category, item.value);
            }
            // displayProgress(dataManager); // updateCategoryProgress should call this already
            alert(`Updated ${item.category}.`);
        });
        testButtonsContainer.appendChild(button);
    });
    progressSection.appendChild(testButtonsContainer);
}
