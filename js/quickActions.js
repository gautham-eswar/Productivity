// js/quickActions.js
function setupQuickActionButtons(dataManager) {
  const quickActionButtons = document.querySelectorAll('.quick-action-btn');

  quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const rawValue = button.dataset.value;
      let value;

      // Determine value type
      if (rawValue === 'true' || rawValue === 'false') {
        value = rawValue === 'true'; // Convert to boolean
      } else if (!isNaN(parseFloat(rawValue))) {
        value = parseFloat(rawValue); // Convert to number
      } else {
        value = rawValue; // Treat as string if not boolean or number
      }

      // For boolean types like 'workout' or 'socialConnection', we need to toggle if already set for the day.
      // The updateCategoryProgress in progress.js might need adjustment or this logic can be here.
      // For now, let's assume updateCategoryProgress handles the logic for incrementing or setting boolean.
      // The spec for updateCategoryProgress for workout was: dailyEntry.completed.workout = !!value;
      // This means if we send 'true', it becomes true. If we want toggle, that needs more logic.
      // Let's simplify for now: if it's a boolean action, get current state and toggle.

      let actualValueToUpdate = value;

      if (action === 'workout' || action === 'socialConnection') {
        const today = dataManager.getTodayDateString();
        const dailyData = dataManager.getDailyEntry(today);
        const currentCompleted = dailyData ? dailyData.completed : {};
        const currentState = currentCompleted ? !!currentCompleted[action] : false;
        actualValueToUpdate = !currentState; // Toggle the boolean state

        // Update button text if it's a toggle
        if (action === 'workout') {
            button.querySelector('.btn-text').textContent = actualValueToUpdate ? 'Workout ✓' : 'Log Workout';
             // Add/remove completed class for visual feedback
            button.classList.toggle('quick-action-btn--completed', actualValueToUpdate);
        }
        // Add similar logic for socialConnection if that button is added
      } else {
         // For non-toggle buttons, maybe a visual feedback like a temporary highlight
         button.classList.add('quick-action-btn--activated');
         setTimeout(() => {
            button.classList.remove('quick-action-btn--activated');
         }, 300);
      }


      if (typeof updateCategoryProgress === 'function') {
        updateCategoryProgress(dataManager, action, actualValueToUpdate);

        // Trigger confetti for "positive" actions
        let confettiTriggered = false;
        if (action === 'workout' || action === 'socialConnection') {
            if (actualValueToUpdate === true) { // Confetti when marked as done
                if (typeof createConfettiBurst === 'function') createConfettiBurst(button);
                confettiTriggered = true;
            }
        } else if (value > 0) { // For incremental tasks, confetti if value added is positive
             if (typeof createConfettiBurst === 'function') createConfettiBurst(button);
             confettiTriggered = true;
        }

        // Visual feedback for completion on non-toggle buttons (already there)
        // This ensures that if confetti was triggered, we don't also do the 'activated' class animation
        if (!confettiTriggered && (action !== 'workout' && action !== 'socialConnection')) {
             button.classList.add('quick-action-btn--activated');
             setTimeout(() => {
                button.classList.remove('quick-action-btn--activated');
             }, 300);
        }
      } else {
        console.error('updateCategoryProgress function not found. Check js/progress.js');
      }
    });
  });
}
