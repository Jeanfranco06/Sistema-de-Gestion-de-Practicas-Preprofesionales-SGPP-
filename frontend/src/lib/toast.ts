import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const defaultToastOptions = {
  toast: true,
  position: 'top-end' as const,
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
};

export function showToast(type: ToastType, title: string, text?: string) {
  return MySwal.fire({
    ...defaultToastOptions,
    icon: type,
    title,
    text,
  });
}

export function showSuccess(title: string, text?: string) {
  return showToast('success', title, text);
}

export function showError(title: string, text?: string) {
  return showToast('error', title, text);
}

export function showWarning(title: string, text?: string) {
  return showToast('warning', title, text);
}

export function showInfo(title: string, text?: string) {
  return showToast('info', title, text);
}

export function showLoading(title = 'Procesando...') {
  return MySwal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => MySwal.showLoading(),
  });
}

export function closeLoading() {
  MySwal.close();
}
