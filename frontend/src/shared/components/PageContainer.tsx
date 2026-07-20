import { ReactNode } from 'react';

interface PageContainerProps {
  children?: ReactNode;
  maxWidth?: string | null;
}

/**
 * Contenedor estándar para páginas internas.
 * Garantiza el mismo encuadre en todos los módulos del sistema.
 */
export default function PageContainer({ children, maxWidth = null }: PageContainerProps) {
  return (
    <div
      style={{
        width: '100%',
        ...(maxWidth ? { maxWidth, marginLeft: 'auto', marginRight: 'auto' } : {}),
      }}
    >
      {children}
    </div>
  );
}
