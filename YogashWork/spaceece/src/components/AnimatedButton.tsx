import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
}

export const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon,
}: AnimatedButtonProps) => {
  const baseClasses = 'font-semibold rounded-3xl transition-all duration-300 flex items-center justify-center gap-2 touch-target';
  
  const variantClasses = {
    primary: 'bg-primary text-white shadow-soft hover:shadow-float',
    secondary: 'bg-white text-primary border-2 border-primary shadow-soft hover:bg-primary hover:text-white',
    success: 'bg-success text-white shadow-soft hover:shadow-float',
    danger: 'bg-error text-white shadow-soft hover:shadow-float',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? disabledClasses : ''}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};
