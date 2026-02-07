import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  className?: string;
  variant?: 'stat' | 'list' | 'calendar';
}

export function SkeletonCard({ className, variant = 'stat' }: SkeletonCardProps) {
  if (variant === 'stat') {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
