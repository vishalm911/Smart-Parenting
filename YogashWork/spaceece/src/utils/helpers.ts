// Calculate XP needed for next level
export const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from XP
export const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP <= xp) {
    totalXP += calculateXPForLevel(level);
    if (totalXP > xp) break;
    level++;
  }
  
  return level;
};

// Calculate progress percentage for current level
export const calculateLevelProgress = (xp: number, level: number): number => {
  const xpForCurrentLevel = calculateXPForLevel(level);
  const xpForPreviousLevels = Array.from({ length: level - 1 }, (_, i) => 
    calculateXPForLevel(i + 1)
  ).reduce((sum, val) => sum + val, 0);
  
  const xpInCurrentLevel = xp - xpForPreviousLevels;
  return Math.min(100, (xpInCurrentLevel / xpForCurrentLevel) * 100);
};

// Format time in seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate accuracy percentage
export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Generate random color
export const getRandomColor = (): string => {
  const colors = ['#F2A100', '#F7B733', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Shuffle array
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Calculate streak
export const calculateStreak = (lastLoginDate: string): number => {
  const today = new Date();
  const lastLogin = new Date(lastLoginDate);
  const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    return 1; // Continue streak
  }
  return 0; // Streak broken
};

// Format date to readable string
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Calculate age from birthdate
export const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
