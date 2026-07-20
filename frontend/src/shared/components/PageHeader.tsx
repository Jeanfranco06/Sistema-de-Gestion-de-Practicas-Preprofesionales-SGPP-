import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      className="mb-6 pb-4 flex justify-between items-start gap-4 flex-wrap"
      style={{ borderBottom: '2px solid var(--color-primary-200)' }}
    >
      <div className="pl-3" style={{ borderLeft: '4px solid var(--color-primary-500)' }}>
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--color-primary-700)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
