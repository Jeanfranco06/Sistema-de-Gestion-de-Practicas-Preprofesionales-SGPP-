import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}

const provider = (children: React.ReactNode) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
);

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ label, value, onChange, disabled, required, error, helperText, className, min, max, placeholder }, ref) => {
    const parsedValue = value && dayjs(value).isValid() ? dayjs(value) : null;

    const handleChange = (date: dayjs.Dayjs | null) => {
      if (onChange) {
        onChange(date && date.isValid() ? date.format('YYYY-MM-DD') : '');
      }
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className={cn('w-full', className)} ref={ref}>
          <MuiDatePicker
          label={label}
          value={parsedValue}
          onChange={handleChange}
          disabled={disabled}
          minDate={min ? dayjs(min) : undefined}
          maxDate={max ? dayjs(max) : undefined}
          slots={{
            openPickerIcon: Calendar,
          }}
          slotProps={{
            textField: {
              required,
              error: !!error,
              helperText: error || helperText,
              placeholder,
              fullWidth: true,
            },
            openPickerButton: {
              className: 'text-muted-foreground',
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '0.75rem',
              backgroundColor: 'var(--color-card)',
              padding: '0.25rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)',
              transition: 'all 150ms ease-in-out',
              '&:hover': {
                borderColor: 'var(--color-primary-400)',
              },
              '&.Mui-focused': {
                borderColor: 'var(--color-primary-500)',
                boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
                pointerEvents: 'none',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiInputBase-input': {
                padding: '0.625rem 0',
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
              color: 'var(--color-foreground)',
              transform: 'translate(0, -1.5rem) scale(1)',
              position: 'relative',
              marginBottom: '0.375rem',
              '&.Mui-focused, &.MuiFormLabel-filled': {
                transform: 'translate(0, -1.5rem) scale(1)',
                color: 'var(--color-foreground)',
              },
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.875rem',
              marginLeft: 0,
              color: error ? 'var(--color-red-600)' : 'var(--color-muted-foreground)',
            },
          }}
        />
        </div>
      </LocalizationProvider>
    );
  }
);
DatePicker.displayName = 'DatePicker';

export { DatePicker, provider as DatePickerProvider };

export function withDatePickerProvider<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Component {...props} />
      </LocalizationProvider>
    );
  };
}
