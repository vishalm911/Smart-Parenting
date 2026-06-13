import confetti from 'canvas-confetti';

export const celebrateSuccess = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#F2A100', '#F7B733', '#FFE4B5', '#22C55E'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#F2A100', '#F7B733', '#FFE4B5', '#22C55E'],
    });
  }, 250);
};

export const celebrateLevelUp = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#F2A100', '#F7B733', '#FFE4B5', '#FFF7E6'],
    zIndex: 9999,
  });
};

export const miniCelebration = () => {
  confetti({
    particleCount: 30,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#F2A100', '#F7B733'],
    zIndex: 9999,
  });
  confetti({
    particleCount: 30,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#F2A100', '#F7B733'],
    zIndex: 9999,
  });
};

// Framer Motion Variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const hoverLift = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.05, y: -5 },
  tap: { scale: 0.95, y: 0 },
};

export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  whileHover: { y: -8, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
