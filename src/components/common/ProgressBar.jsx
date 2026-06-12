import { motion } from 'framer-motion';

/**
 * Animated progress bar with label and percentage.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  color = '#F5A623',
  showPercentage = true,
  height = 12,
  className = '',
}) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-semibold text-[#6B6B6B] dark:text-[#A0A0B0]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold" style={{ color }}>
              {percent}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full bg-[#F0E8DA] dark:bg-[#243447] rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </div>
  );
}
