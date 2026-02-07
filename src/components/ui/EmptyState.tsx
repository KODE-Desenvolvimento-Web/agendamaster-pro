import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode | {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;
    
    // Check if action is an object with label/onClick properties
    if (typeof action === 'object' && action !== null && 'label' in action && 'onClick' in action) {
      const actionObj = action as { label: string; onClick: () => void };
      return (
        <Button onClick={actionObj.onClick} className="mt-6">
          {actionObj.label}
        </Button>
      );
    }
    
    // It's a ReactNode
    return <div className="mt-6">{action as ReactNode}</div>;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {renderAction()}
    </div>
  );
}
