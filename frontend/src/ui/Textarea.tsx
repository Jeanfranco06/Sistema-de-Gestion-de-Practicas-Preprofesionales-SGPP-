import * as React from 'react';
import { cn } from '../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-foreground)',
              marginBottom: '0.375rem',
            }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          style={{
            width: '100%',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-input)',
            backgroundColor: 'var(--color-card)',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            color: 'var(--color-foreground)',
            transition: 'all 150ms ease',
            outline: 'none',
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary-500)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(var(--color-primary-500-rgb), 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-input)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />
        {error && (
          <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-red-600)' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };