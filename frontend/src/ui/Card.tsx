import * as React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-soft)',
      },
      hover: {
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-soft)',
        transition: 'box-shadow 200ms ease',
      },
      glass: {
        backgroundColor: 'rgba(var(--color-card-rgb), 0.8)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(var(--color-border-rgb), 0.5)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-soft)',
      },
    };

    return (
      <div ref={ref} style={variants[variant]} className={cn(className)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        padding: '1.5rem 1.5rem 0',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--color-border)',
      }}
      className={cn(className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--color-foreground)',
      }}
      className={cn(className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      style={{
        marginTop: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--color-muted-foreground)',
      }}
      className={cn(className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ padding: '1.5rem' }}
      className={cn(className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'var(--color-border)',
      }}
      className={cn(className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };