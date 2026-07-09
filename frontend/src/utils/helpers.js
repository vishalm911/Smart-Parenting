/**
 * Utility helper functions
 */

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Format date to readable string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time ago string
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(timestamp);
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return { score, label: labels[Math.min(score - 1, 4)] || 'Very Weak' };
};

/**
 * Get avatar emoji by avatar ID
 */
export const getAvatarEmoji = (avatarId) => {
  const avatarMap = {
    avatar1: '🧑‍🚀',
    avatar2: '🚀',
    avatar3: '⭐',
    avatar4: '🪐',
    avatar5: '🌙',
    avatar6: '☀️',
    avatar7: '🌈',
    avatar8: '🦋',
    avatar9: '🧸',
    avatar10: '🤖',
    avatar11: '🦄',
    avatar12: '🐉',
  };
  return avatarMap[avatarId] || '🧑‍🚀';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate a random color from brand palette
 */
export const getRandomBrandColor = () => {
  const colors = ['#1F3A68', '#F5A623', '#FFC107', '#48BB78', '#4299E1', '#9F7AEA'];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Speech synthesis speak helper with high-quality voice selection
 */
export const speakText = (text, options = {}) => {
  if (!window.speechSynthesis) {
    options.onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip HTML tags if any
  const cleanText = text.replace(/<[^>]+>/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set default configurations
  utterance.rate = options.rate ?? 0.85; // Slightly slower for kids
  utterance.pitch = options.pitch ?? 1.1; // Warm, child-friendly pitch
  utterance.lang = options.lang ?? "en-US";

  // Select the highest quality voice
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  if (options.onEnd) {
    utterance.onend = () => options.onEnd();
  }
  
  if (options.onError) {
    utterance.onerror = (e) => options.onError(e);
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Cancel any current speech synthesis
 */
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
