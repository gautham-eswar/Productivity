// js/contextTags.js
function createContextTagSelection(containerId, dataManager) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Context tag container not found.');
    return;
  }

  const PREDEFINED_CONTEXT_TAGS = [
    { id: 'good_weather', label: '☀️ Good Weather', category: 'environmental' },
    { id: 'bad_weather', label: '🌧️ Bad Weather', category: 'environmental' },
    { id: 'deadline_pressure', label: '⏰ Deadline', category: 'stress' }, // Shortened label
    { id: 'social_plans', label: '👥 Social Plans', category: 'social' },
    { id: 'well_rested', label: '😴 Well Rested', category: 'physical' },
    { id: 'tired', label: '🥱 Tired', category: 'physical' },
    { id: 'stressed', label: '😰 Stressed', category: 'mental' },
    { id: 'relaxed', label: '😌 Relaxed', category: 'mental' },
    { id: 'busy_schedule', label: '🏃 Busy Day', category: 'time' }, // Shortened
    { id: 'free_time', label: '🆓 Free Time', category: 'time' },
    { id: 'motivation_high', label: '🚀 High Motivation', category: 'motivation' },
    { id: 'motivation_low', label: '😑 Low Motivation', category: 'motivation' }
  ];

  let selectedPredefinedTags = [];
  let customTag = '';

  // Load initial values from DataManager
  const today = dataManager.getTodayDateString();
  const dailyData = dataManager.getDailyEntry(today);
  if (dailyData && dailyData.contextTags) {
    dailyData.contextTags.forEach(tag => {
      const isPredefined = PREDEFINED_CONTEXT_TAGS.find(pt => pt.id === tag);
      if (isPredefined) {
        if (selectedPredefinedTags.length < 3) selectedPredefinedTags.push(tag);
      } else if (!customTag) { // Only one custom tag
        customTag = tag;
      }
    });
  }

  container.innerHTML = `
    <label class="context-tags-label">Context Tags (Max 3 + 1 Custom):</label>
    <div class="context-tags-grid">
        ${PREDEFINED_CONTEXT_TAGS.map(tag => `
            <button class="context-tag-btn ${selectedPredefinedTags.includes(tag.id) ? 'selected' : ''}" data-id="${tag.id}">
                ${tag.label}
            </button>
        `).join('')}
    </div>
    <div class="custom-tag-area">
        <button class="context-tag-btn custom-tag-toggle-btn ${customTag ? 'selected' : ''}">Custom Tag</button>
        <input type="text" class="custom-tag-input ${customTag ? '' : 'hidden'}" placeholder="Enter custom tag" value="${customTag}">
    </div>
  `;

  const predefinedTagButtons = container.querySelectorAll('.context-tags-grid .context-tag-btn');
  const customTagToggleButton = container.querySelector('.custom-tag-toggle-btn');
  const customTagInput = container.querySelector('.custom-tag-input');

  function saveData() {
    const allTags = [...selectedPredefinedTags];
    if (customTagInput.value.trim()) {
      allTags.push(customTagInput.value.trim());
    }
    dataManager.updateDailyEntry(today, { contextTags: allTags });
  }

  predefinedTagButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tagId = button.dataset.id;
      if (selectedPredefinedTags.includes(tagId)) {
        selectedPredefinedTags = selectedPredefinedTags.filter(id => id !== tagId);
        button.classList.remove('selected');
      } else {
        if (selectedPredefinedTags.length < 3) {
          selectedPredefinedTags.push(tagId);
          button.classList.add('selected');
          // Creative enhancement: animation
          button.style.animation = 'tagSelectAnim 0.3s ease-out';
          setTimeout(() => button.style.animation = '', 300);
        } else {
          alert('You can select a maximum of 3 predefined tags.');
        }
      }
      saveData();
    });
  });

  customTagToggleButton.addEventListener('click', () => {
    customTagInput.classList.toggle('hidden');
    customTagToggleButton.classList.toggle('selected', !customTagInput.classList.contains('hidden'));
    if (!customTagInput.classList.contains('hidden')) {
      customTagInput.focus();
    } else { // If hiding, clear and save if it was cleared
        if (!customTagInput.value) { // if it was already empty and we are hiding
             customTag = ''; // ensure internal state is also clear
             saveData();
        }
    }
  });

  customTagInput.addEventListener('change', () => { // Using change instead of input to save on blur or enter
    customTag = customTagInput.value.trim();
    saveData();
  });
  customTagInput.addEventListener('input', () => { // Update button state while typing
     customTagToggleButton.classList.toggle('selected', customTagInput.value.trim() !== '');
  });
}
