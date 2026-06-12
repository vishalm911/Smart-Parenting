import { motion } from 'framer-motion';

/**
 * Decorative floating elements (stars, shapes, sparkles) for page backgrounds.
 */
const ELEMENTS = [
  { emoji: '⭐', size: 24, x: '5%', y: '15%', delay: 0 },
  { emoji: '🌟', size: 18, x: '90%', y: '10%', delay: 0.5 },
  { emoji: '✨', size: 20, x: '80%', y: '60%', delay: 1 },
  { emoji: '💫', size: 22, x: '15%', y: '70%', delay: 1.5 },
  { emoji: '🔮', size: 16, x: '70%', y: '85%', delay: 0.3 },
  { emoji: '🌈', size: 20, x: '50%', y: '5%', delay: 0.8 },
  { emoji: '☁️', size: 28, x: '25%', y: '30%', delay: 1.2 },
  { emoji: '🎈', size: 22, x: '85%', y: '35%', delay: 0.6 },
];

export default function FloatingElements({ count = 8 }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {ELEMENTS.slice(0, count).map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.15, 0.3, 0.15],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute select-none"
          style={{
            left: el.x,
            top: el.y,
            fontSize: el.size,
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  );
}
