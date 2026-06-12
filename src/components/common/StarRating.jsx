import { motion } from 'framer-motion';

/**
 * Star rating display with animation on earn.
 */
export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 28,
  animated = true,
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < rating;
        return (
          <motion.span
            key={i}
            initial={animated ? { scale: 0, rotate: -180 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: animated ? i * 0.1 : 0,
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
            style={{ fontSize: size }}
            className={`inline-block ${
              filled
                ? 'drop-shadow-[0_2px_4px_rgba(245,166,35,0.5)]'
                : 'opacity-25 grayscale'
            }`}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}
