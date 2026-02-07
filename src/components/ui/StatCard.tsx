import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  className,
  variant = 'default',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = change === 0;

  const variantStyles = {
    default: 'bg-card border-border',
    primary: 'bg-gradient-primary border-transparent text-primary-foreground',
    success: 'bg-gradient-success border-transparent text-success-foreground',
    warning: 'bg-warning/10 border-warning/20',
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-smooth hover:shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          
          {typeof change !== 'undefined' && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                  isPositive && "text-success bg-success/10",
                  isNegative && "text-destructive bg-destructive/10",
                  isNeutral && "text-muted-foreground bg-muted"
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {isNeutral && <Minus className="h-3 w-3" />}
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className={cn(
                "text-xs",
                variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
              )}>
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-white/20'
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Decorative gradient blob */}
      {variant !== 'default' && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      )}
    </div>
  );
}
