import { ReactNode } from 'react';
import { CSSProperties } from 'react';
import { accents, AccentKey, statAccentKeys } from '../theme/designTokens';

interface StatItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: AccentKey;
}

interface StatStripProps {
  items?: StatItem[];
  sx?: CSSProperties;
}

export default function StatStrip({ items = [], sx }: StatStripProps) {
  return (
    <div
      className="mb-4 rounded-lg flex flex-wrap overflow-hidden"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        ...sx,
      }}
    >
      {items.map((item, i) => {
        const key = item.accent || statAccentKeys[i % statAccentKeys.length];
        const accent = accents[key] || accents.blue;

        return (
          <div
            key={item.label}
            className="flex items-start gap-3 px-4 py-4"
            style={{
              flex: '1 1 140px',
              borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              minWidth: '140px',
            }}
          >
            {item.icon && (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: accent.bg,
                  color: accent.main,
                  border: `1px solid ${accent.border}`,
                }}
              >
                {item.icon}
              </div>
            )}
            <div className="min-w-0">
              <span
                className="text-xs uppercase tracking-wide block"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {item.label}
              </span>
              <span
                className="text-base font-semibold capitalize mt-1 block"
                style={{ color: accent.main }}
              >
                {item.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
