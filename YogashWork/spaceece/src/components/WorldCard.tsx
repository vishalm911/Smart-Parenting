import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorldCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  progress: number;
  score: number;
  path: string;
  illustration?: string;
}

export const WorldCard = ({
  title,
  description,
  icon: Icon,
  color,
  progress,
  score,
  path,
}: WorldCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="world-card cursor-pointer relative"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={32} style={{ color }} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-dark">{score}</div>
          <div className="text-xs text-gray-600">points</div>
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-dark mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-dark">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 rounded-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};
