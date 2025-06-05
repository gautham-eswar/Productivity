// js/sleepInputs.js
function createSleepInputs(sleepHoursContainerId, sleepQualityContainerId, dataManager) {
  const hoursContainer = document.getElementById(sleepHoursContainerId);
  const qualityContainer = document.getElementById(sleepQualityContainerId);

  if (!hoursContainer || !qualityContainer) {
    console.error('Sleep input containers not found.');
    return;
  }

  let currentSleepHours = 8; // Default
  let currentSleepQuality = 3; // Default

  // Load initial values from DataManager
  const today = dataManager.getTodayDateString();
  const dailyData = dataManager.getDailyEntry(today);
  if (dailyData) {
    if (dailyData.sleepHours !== undefined) currentSleepHours = dailyData.sleepHours;
    if (dailyData.sleepQuality !== undefined) currentSleepQuality = dailyData.sleepQuality;
  }

  // --- Sleep Hours Slider ---
  hoursContainer.innerHTML = `
    <label for="sleep-hours-slider" class="sleep-label">
        <span class="sleep-icon">🌙</span> Sleep Hours: <span class="sleep-hours-value">${currentSleepHours}h</span>
    </label>
    <input type="range" id="sleep-hours-slider" class="sleep-hours-slider" min="0" max="12" step="0.5" value="${currentSleepHours}">
  `;
  const hoursSlider = hoursContainer.querySelector('#sleep-hours-slider');
  const hoursValueDisplay = hoursContainer.querySelector('.sleep-hours-value');

  hoursSlider.addEventListener('input', () => {
    currentSleepHours = parseFloat(hoursSlider.value);
    hoursValueDisplay.textContent = `${currentSleepHours}h`;
    // Simple visual fill (background gradient)
    const percentage = (currentSleepHours / 12) * 100;
    hoursSlider.style.background = `linear-gradient(to right, var(--cyan-accent) ${percentage}%, var(--light-gray) ${percentage}%)`;

    dataManager.updateDailyEntry(today, { sleepHours: currentSleepHours });
  });
  // Initial visual state for slider
  const initialPercentage = (currentSleepHours / 12) * 100;
  hoursSlider.style.background = `linear-gradient(to right, var(--cyan-accent) ${initialPercentage}%, var(--light-gray) ${initialPercentage}%)`;


  // --- Sleep Quality Stars ---
  qualityContainer.innerHTML = `
    <label class="sleep-label"><span class="sleep-icon">⭐</span> Sleep Quality:</label>
    <div class="sleep-quality-stars">
        ${[1, 2, 3, 4, 5].map(star => `<span class="star" data-value="${star}">${currentSleepQuality >= star ? '★' : '☆'}</span>`).join('')}
    </div>
  `;
  const stars = qualityContainer.querySelectorAll('.sleep-quality-stars .star');

  function updateStars(rating) {
    stars.forEach(star => {
      star.textContent = parseInt(star.dataset.value) <= rating ? '★' : '☆';
      star.classList.toggle('filled', parseInt(star.dataset.value) <= rating);
    });
  }

  stars.forEach(star => {
    star.addEventListener('click', () => {
      currentSleepQuality = parseInt(star.dataset.value);
      updateStars(currentSleepQuality);
      dataManager.updateDailyEntry(today, { sleepQuality: currentSleepQuality });
    });
    star.addEventListener('mouseover', () => {
        const hoverValue = parseInt(star.dataset.value);
        stars.forEach(s => {
            s.textContent = parseInt(s.dataset.value) <= hoverValue ? '★' : '☆';
        });
    });
    star.addEventListener('mouseout', () => {
        updateStars(currentSleepQuality); // Revert to actual selected quality
    });
  });
  // Initial star state
  updateStars(currentSleepQuality);
}
