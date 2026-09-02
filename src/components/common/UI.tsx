import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("bg-card text-card-foreground rounded-xl border shadow-sm", className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
};

// --- Badge ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success/10 text-success dark:bg-success/20 dark:text-green-400',
    warning: 'bg-warning/10 text-warning-foreground dark:bg-warning/20 dark:text-yellow-400 text-yellow-700',
    destructive: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400',
    outline: 'border border-border text-foreground',
  };

  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

// --- Skeleton ---
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  );
};