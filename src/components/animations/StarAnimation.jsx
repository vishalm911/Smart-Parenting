import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated star-burst effect that plays when a star is earned.
 */
export default function StarAnimation({ show = false }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
        >
          {/* Central star */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-8xl drop-shadow-2xl"
          >
            ⭐
          </motion.div>

          {/* Radial sparkles */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <motion.div
              key={deg}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: Math.cos((deg * Math.PI) / 180) * 120,
                y: Math.sin((deg * Math.PI) / 180) * 120,
              }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="absolute text-3xl"
            >
              ✨
            </motion.div>
          ))}

          {/* Glow ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-32 h-32 rounded-full bg-[#F5A623]/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
