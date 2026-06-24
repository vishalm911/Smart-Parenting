import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MASCOT_MESSAGES = [
  "I'm here if you need me! 🤗",
  "Let's keep going! 👍",
  "You're doing great! 🌟",
  "Tap me for a hint! 💡",
  "Learning is fun! 🎉",
];

/**
 * Floating mascot helper in the bottom-right corner.
 * Matches the reference UI's SpacECE mascot button.
 */
export default function Mascot() {
  const [open, setOpen] = React.useState(false);
  const [msgIdx] = React.useState(() => Math.floor(Math.random() * MASCOT_MESSAGES.length));

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
      {/* Chat bubble */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="mascot-bubble"
          >
            {MASCOT_MESSAGES[msgIdx]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #F5A623, #FFD180)' }}
        aria-label="SpacECE Mascot"
      >
        <div className="text-center">
          <div className="text-2xl">🏠</div>
          <div className="text-[7px] font-bold text-[#1A1A1A] leading-none">SpacECE</div>
        </div>
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#F5A623] animate-pulse-ring pointer-events-none"
        />
      </motion.button>
    </div>
  );
}
