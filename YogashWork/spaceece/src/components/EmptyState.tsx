import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card text-center py-12"
    >
      <div className="w-20 h-20 rounded-3xl bg-gray-100 mb-6 flex items-center justify-center mx-auto">
        <Icon size={40} className="text-gray-400" />
      </div>
      <h3 className="text-2xl font-extrabold text-dark mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <AnimatedButton onClick={onAction}>{actionLabel}</AnimatedButton>
      )}
    </motion.div>
  );
};
