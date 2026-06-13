import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export const ProgressCard = ({
  title,
  value,
  icon: Icon,
  color = '#F2A100',
  subtitle,
}: ProgressCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card text-center"
    >
      <div
        className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center mx-auto"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div className="text-3xl font-extrabold text-dark mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </motion.div>
  );
};
