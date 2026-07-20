import { ReactNode } from 'react';
import { CSSProperties } from 'react';

interface ModulePageShellProps {
  children?: ReactNode;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: CSSProperties;
}

export function ModulePageShell({ children, maxWidth = 'xl', sx }: ModulePageShellProps) {
  const maxWidthMap: Record<string, string> = {
    xs: '444px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  };

  return (
    <div
      className="mx-auto"
      style={{
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        maxWidth: maxWidth === false ? undefined : maxWidthMap[maxWidth],
        ...sx,
      }}
    >
      {children}
    </div>
  );
}

interface ModulePageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function ModulePageHeader({ icon, title, subtitle, action }: ModulePageHeaderProps) {
  return (
    <div className="flex justify-between items-start gap-4 flex-wrap mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="text-primary-500" style={{ color: 'var(--color-primary-500)' }}>
            {icon}
          </div>
        )}
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-primary-500)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface ModuleToolbarProps {
  children?: ReactNode;
}

export function ModuleToolbar({ children }: ModuleToolbarProps) {
  return (
    <div
      className="p-4 mb-4 rounded-lg"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {children}
    </div>
  );
}

interface ModuleTableContainerProps {
  children?: ReactNode;
}

export function ModuleTableContainer({ children }: ModuleTableContainerProps) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {children}
    </div>
  );
}

export const moduleHeadCellSx: CSSProperties = {
  color: '#fff',
  fontWeight: 'bold',
};

export const moduleSortLabelSx: CSSProperties = {
  color: '#fff !important',
};
