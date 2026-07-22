import { cn } from '../lib/utils';
import { Skeleton } from './Skeleton';

interface PageSkeletonProps {
  className?: string;
}

function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-surface-background', className)}>
      <div className="flex h-16 items-center border-b border-surface-border bg-surface-card px-6">
        <Skeleton variant="rectangular" className="h-8 w-40" />
        <div className="ml-auto flex items-center gap-4">
          <Skeleton variant="circular" className="h-8 w-8" />
          <Skeleton variant="circular" className="h-8 w-8" />
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="hidden w-60 border-r border-surface-border bg-surface-card p-4 lg:block">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-48 w-full" />
            <Skeleton variant="rectangular" className="h-48 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

function CardSkeleton({ className, lines = 4 }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-surface-border bg-surface-card p-6', className)}>
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-6 h-4 w-32" />

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${85 - i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

function TableSkeleton({ rows = 5, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-surface-border bg-surface-card', className)}>
      <div className="flex border-b border-surface-border bg-surface-muted/50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center border-b border-surface-border px-4 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className="flex-1 px-2">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-surface-border bg-surface-card p-6', className)}>
      <Skeleton className="mb-6 h-6 w-40" />

      <div className="space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton variant="rectangular" className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Skeleton variant="rectangular" className="h-10 w-24 rounded-lg" />
        <Skeleton variant="rectangular" className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

interface StatSkeletonProps {
  count?: number;
  className?: string;
}

function StatSkeleton({ count = 4, className }: StatSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-surface-border bg-surface-card p-5"
        >
          <Skeleton className="mb-3 h-4 w-28" />
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export { PageSkeleton, CardSkeleton, TableSkeleton, FormSkeleton, StatSkeleton };
