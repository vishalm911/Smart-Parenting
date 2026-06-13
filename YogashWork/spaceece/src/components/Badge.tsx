import { motion } from 'framer-motion';

interface BadgeProps {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const Badge = ({ icon, name, description, unlocked, unlockedAt }: BadgeProps) => {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
      className={`card text-center ${!unlocked ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-extrabold text-dark mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {unlocked && unlockedAt && (
        <p className="text-xs text-success font-semibold">Unlocked {unlockedAt}</p>
      )}
      {!unlocked && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
          <span>🔒</span>
          <span>Locked</span>
        </div>
      )}
    </motion.div>
  );
};
