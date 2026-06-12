import { motion } from 'framer-motion';

/**
 * Reusable game card component with gradient background, hover effects,
 * and floating emoji illustration.
 */
export default function GameCard({
  title,
  description,
  emoji = '🎮',
  gradient = 'bg-gradient-warm',
  ageRange,
  difficulty,
  stars = 0,
  maxStars = 5,
  onClick,
  locked = false,
  index = 0,
}) {


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={locked ? {} : { y: -6, scale: 1.02 }}
      whileTap={locked ? {} : { scale: 0.97 }}
      onClick={locked ? undefined : onClick}
      className={`relative overflow-hidden rounded-3xl cursor-pointer group ${
        locked ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {/* Gradient background */}
      <div className={`${gradient} p-5 pb-6 relative`}>
        {/* Floating emoji illustration */}
        <div className="absolute -top-2 -right-2 text-6xl opacity-20 group-hover:opacity-30 transition-opacity animate-float select-none pointer-events-none">
          {emoji}
        </div>

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
            <span className="text-4xl">🔒</span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-[5]">
          {/* Age Range Badge */}
          {ageRange && (
            <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-xs font-bold rounded-full px-3 py-1 mb-3">
              Age {ageRange}
            </span>
          )}

          {/* Emoji & Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl drop-shadow-lg">{emoji}</span>
            <h3
              className="text-white text-lg font-bold leading-tight drop-shadow"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-white/85 text-sm leading-relaxed mb-3">{description}</p>

          {/* Bottom row: stars + difficulty */}
          <div className="flex items-center justify-between">
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: maxStars }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < stars ? 'opacity-100' : 'opacity-30'}`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Difficulty */}
            {difficulty && (
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-2.5 py-0.5">
                {difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
