// js/effects.js
function createConfettiBurst(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  // Use pageXOffset and pageYOffset for coordinates relative to the document
  const centerX = rect.left + rect.width / 2 + window.pageXOffset;
  const centerY = rect.top + rect.height / 2 + window.pageYOffset;
  const particleCount = 12; // Number of confetti particles

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';

    // Position particle at the center of the button initially
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';

    // Randomize confetti properties
    const angle = Math.random() * 360; // Random angle
    const distance = 50 + Math.random() * 50; // Random distance (50px to 100px)
    const size = 4 + Math.random() * 4; // Random size (4px to 8px)
    const duration = 0.6 + Math.random() * 0.4; // Random duration (0.6s to 1s)

    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Using CSS variables for animation properties
    particle.style.setProperty('--confetti-end-x', (Math.cos(angle * Math.PI / 180) * distance) + 'px');
    particle.style.setProperty('--confetti-end-y', (Math.sin(angle * Math.PI / 180) * distance) + 'px');
    particle.style.setProperty('--confetti-rotation', (Math.random() * 360 - 180) + 'deg'); // Random rotation
    particle.style.animationDuration = duration + 's';

    // Randomize background color from a predefined palette
    const colors = ['var(--gold-success)', 'var(--cyan-accent)', 'var(--electric-orange)', 'var(--coral-alert)'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(particle);

    // Remove particle after animation finishes
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }
}
