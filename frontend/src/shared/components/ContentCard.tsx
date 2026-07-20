import { ReactNode } from 'react';
import { CSSProperties } from 'react';

interface ContentCardProps {
  children?: ReactNode;
  sx?: CSSProperties;
  noPadding?: boolean;
  accent?: boolean;
}

export default function ContentCard({ children, sx, noPadding = false, accent = false }: ContentCardProps) {
  return (
    <div
      style={{
        borderRadius: '0.5rem',
        padding: noPadding ? 0 : '1rem',
        marginBottom: '1rem',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        borderTop: accent ? '3px solid var(--color-primary-500)' : undefined,
        ...sx,
      }}
    >
      {children}
    </div>
  );
}
