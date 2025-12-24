export function triggerConfetti() {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const confettiCount = 50;
  
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  document.body.appendChild(container);
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = Math.random() * 2 + 2;
    
    confetti.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
    `;
    
    container.appendChild(confetti);
  }
  
  // Add keyframes if not exists
  if (!document.querySelector('#confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confetti-fall {
        0% { 
          transform: translateY(0) rotate(0deg) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(100vh) rotate(720deg) scale(0.5); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => container.remove(), 4000);
}

export function triggerMilestoneConfetti(count: number) {
  // Extra confetti for milestones
  if ([5, 10, 25, 50, 100].includes(count)) {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => triggerConfetti(), i * 200);
    }
    return true;
  }
  return false;
}
