import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputOtpProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  numDigits?: number;
  error?: string;
  label?: string;
  helperText?: string;
}

const InputOtp = React.forwardRef<HTMLInputElement, InputOtpProps>(
  ({ className, value = '', onChange, numDigits = 6, error, label, helperText, id, disabled, ...props }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const inputId = id || React.useId();

    const values = Array.from({ length: numDigits }, (_, i) => value[i] ?? '');

    const focusTo = (index: number) => {
      const next = inputRefs.current[index];
      if (next) {
        next.focus();
        next.select();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const char = e.target.value.replace(/\D/g, '').slice(-1);
      if (!char) return;

      const newValue = value.split('');
      newValue[index] = char;
      const joined = newValue.join('').slice(0, numDigits);
      onChange?.(joined);

      if (index < numDigits - 1) focusTo(index + 1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newValue = value.split('');
        newValue[index] = '';
        const joined = newValue.join('');
        onChange?.(joined);
        if (index > 0) focusTo(index - 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (index > 0) focusTo(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (index < numDigits - 1) focusTo(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, numDigits);
      if (!pasted) return;
      onChange?.(pasted);
      const targetIndex = Math.min(pasted.length, numDigits - 1);
      focusTo(targetIndex);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
            {label}
          </label>
        )}
        <div className="flex items-center gap-2" role="group" aria-label="OTP input">
          {values.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              id={index === 0 ? inputId : undefined}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              onFocus={(e) => e.currentTarget.select()}
              style={{
                width: numDigits > 6 ? '2.5rem' : '3rem',
                height: numDigits > 6 ? '2.5rem' : '3rem',
                borderRadius: 'var(--radius-xl)',
                border: error ? '1px solid var(--color-red-500)' : '1px solid var(--color-input)',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-foreground)',
                textAlign: 'center',
                fontSize: '1.125rem',
                fontWeight: 600,
                outline: 'none',
                transition: 'all 150ms ease',
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(var(--color-primary-500-rgb), 0.2)';
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = error ? 'var(--color-red-500)' : 'var(--color-input)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              {...props}
            />
          ))}
        </div>
        {error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--color-red-600)' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
InputOtp.displayName = 'InputOtp';

export { InputOtp };
