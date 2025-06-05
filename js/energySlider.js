// js/energySlider.js
function createEnergySlider(containerId, dataManager, dataKey, initialValue = 6) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Energy slider container #${containerId} not found.`);
    return;
  }

  let currentValue; // Will be set below

  // Load initial values from DataManager OR predict if not set for today
  const todayString = dataManager.getTodayDateString(); // Assuming dataManager has this method
  const dailyDataForToday = dataManager.getDailyEntry(todayString);

  if (dailyDataForToday && dailyDataForToday[dataKey] !== undefined) {
    currentValue = dailyDataForToday[dataKey];
  } else if (dataKey === 'energyPredicted') { // Only predict for 'energyPredicted'
    // Ensure getInitialEnergyPrediction is accessible, it's in suggestions.js
    if (typeof getInitialEnergyPrediction === 'function') {
      currentValue = getInitialEnergyPrediction(dataManager.data, todayString, dataManager);
      // Optionally, save this initial prediction back to DataManager immediately
      // dataManager.updateDailyEntry(todayString, { [dataKey]: currentValue });
      // Decided against immediate save to let user confirm/adjust first.
      // The first interaction with the slider will save it.
    } else {
      console.warn('getInitialEnergyPrediction function not found. Using default for energy slider.');
      currentValue = 6; // Default 6 for predicted
    }
  } else {
    // For other dataKeys (like energyActual) or if prediction function not found
    currentValue = (dataKey === 'energyActual' && initialValue === 6) ? 5 : initialValue; // Default 5 for actual if not set, else initialValue (which is 6 for predicted)
  }


  container.innerHTML = `
    <div class="energy-slider__track">
      <div class="energy-slider__inner">
        <span class="energy-slider__value">${currentValue}</span>
        <span class="energy-slider__emoji">${getEnergyEmoji(currentValue)}</span>
      </div>
    </div>
    <input type="range" min="1" max="10" value="${currentValue}" class="energy-slider__input-hidden" aria-label="Energy Level">
  `;

  const track = container.querySelector('.energy-slider__track');
  const valueDisplay = container.querySelector('.energy-slider__value');
  const emojiDisplay = container.querySelector('.energy-slider__emoji');
  const hiddenInput = container.querySelector('.energy-slider__input-hidden'); // For accessibility & form submission if needed

  function updateSliderVisuals(value) {
    valueDisplay.textContent = value;
    emojiDisplay.textContent = getEnergyEmoji(value);

    // Update conic gradient based on value
    // Hue: 0 (red) for 1, up to ~240 (blue-ish green) for 10. Let's map 1-10 to 0-300 hue range for wider colors.
    // Red (0) -> Orange (30) -> Yellow (60) -> Lime Green (90) -> Green (120) -> Teal (180) -> Cyan (210) -> Light Blue (240) -> Blue (270) -> Purple (300)
    // Simplified: Red (1) -> Orange (3-4) -> Yellow (5-6) -> Cyan (7-8) -> Gold (9-10) (as per spec)

    let colorStops = 'var(--red-day) 0deg 36deg, var(--electric-orange) 36deg 108deg, var(--yellow-day) 108deg 180deg, var(--cyan-accent) 180deg 288deg, var(--gold-success) 288deg 360deg';
    // This is static based on spec. If dynamic fill is needed, it's more complex.
    // For dynamic fill:
    const percentage = (value - 1) / 9 * 360; // 0 to 360 degrees
    track.style.background = `conic-gradient(
        ${getEnergyColor(value)} 0deg ${percentage}deg,
        var(--light-gray) ${percentage}deg 360deg
    )`;


    // Particle effects (placeholder for now)
    if (value >= 8) {
      // createEnergyParticles('high', container); // Placeholder
    } else if (value <= 3) {
      // createEnergyParticles('low', container); // Placeholder
    }
  }

  function getEnergyColor(value) {
    if (value <= 2) return 'var(--red-day)';
    if (value <= 4) return 'var(--electric-orange)';
    if (value <= 6) return 'var(--yellow-day)';
    if (value <= 8) return 'var(--cyan-accent)';
    return 'var(--gold-success)';
  }

  function getEnergyEmoji(value) {
    if (value >= 9) return '🚀'; // Rocket
    if (value >= 7) return '⚡'; // Lightning
    if (value >= 5) return '😊'; // Smiley
    if (value >= 3) return '😟'; // Worried
    return '😫'; // Tired
  }

  // Mouse/Touch interaction logic
  let isDragging = false;

  function handleInteraction(event) {
    const rect = track.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX = event.clientX || (event.touches && event.touches[0].clientX);
    let clientY = event.clientY || (event.touches && event.touches[0].clientY);

    const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
    let angleDeg = (angleRad * 180 / Math.PI + 360 + 90) % 360; // +90 to start top as 0 deg

    let newValue = Math.round((angleDeg / 360) * 9) + 1; // Map 0-359 to 1-10
    newValue = Math.max(1, Math.min(10, newValue)); // Clamp value

    if (newValue !== currentValue) {
      currentValue = newValue;
      hiddenInput.value = currentValue;
      updateSliderVisuals(currentValue);
      if (dataManager) {
        const today = dataManager.getTodayDateString();
        dataManager.updateDailyEntry(today, { [dataKey]: currentValue });
      }
    }
  }

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleInteraction(e);
    e.preventDefault();
  });
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleInteraction(e);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) handleInteraction(e);
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) handleInteraction(e);
  }, { passive: false });

  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('touchend', () => isDragging = false);

  // Initial setup
  updateSliderVisuals(currentValue);
  return container; // Return the container element
}
