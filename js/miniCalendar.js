// js/miniCalendar.js
function displayMiniCalendar(containerId, dataManager) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Mini calendar container not found.');
    return;
  }

  const weekDateStrings = dataManager.getCurrentWeekDateStrings(); // Assumes Monday is the first day
  const todayDateString = dataManager.getTodayDateString();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let calendarHTML = '<div class="mini-calendar-days">';

  weekDateStrings.forEach((dateStr, index) => {
    const dayData = dataManager.getDailyEntry(dateStr);
    const dayType = dayData ? dayData.dayType : null; // 'green', 'yellow', 'red', or null
    const isToday = dateStr === todayDateString;
    const dateObj = new Date(dateStr + 'T00:00:00'); // Ensure correct date parsing for day number
    const dayNumber = dateObj.getDate();

    let dayClass = 'mini-calendar-day';
    if (isToday) dayClass += ' today';
    if (dayType) dayClass += ` day-type-${dayType}`;

    // Creative enhancement: Staggered animation delay for appearance
    const animationDelay = index * 0.05; // 50ms delay increment

    calendarHTML += `
      <div class="${dayClass}" style="animation-delay: ${animationDelay}s">
        <div class="mini-calendar-day-name">${dayNames[index]}</div>
        <div class="mini-calendar-day-number">${dayNumber}</div>
        <div class="mini-calendar-day-type-indicator"></div>
      </div>
    `;
  });
  calendarHTML += '</div>';
  container.innerHTML = calendarHTML;
}
