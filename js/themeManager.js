// js/themeManager.js
function initializeTheme(dataManager) {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlElement = document.documentElement;

  let currentTheme = dataManager.data.profile.preferences.theme || 'light'; // Default to light

  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlElement.classList.add('dark-mode');
      if (themeToggleBtn) {
        themeToggleBtn.classList.add('dark-active'); // For styling the button itself
        themeToggleBtn.setAttribute('aria-pressed', 'true');
      }
    } else {
      htmlElement.classList.remove('dark-mode');
      if (themeToggleBtn) {
        themeToggleBtn.classList.remove('dark-active');
        themeToggleBtn.setAttribute('aria-pressed', 'false');
      }
    }
    currentTheme = theme;
    // Save preference
    dataManager.updateProfile({ preferences: { ...dataManager.data.profile.preferences, theme: currentTheme } });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  // Apply initial theme on load
  applyTheme(currentTheme);

  // Make applyTheme globally accessible if needed for other parts of the app to refresh it
  // window.applyAppTheme = applyTheme; // Optional
}
