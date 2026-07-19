import { type FieldError, type Merge, type FieldErrorsImpl } from 'react-hook-form';

export function getErrorMessage(error: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if ('message' in error && typeof error.message === 'string') return error.message;
  return 'Campo inválido';
}

export function isFieldError(error: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined): boolean {
  if (!error) return false;
  if ('type' in error && error.type) return true;
  return false;
}
