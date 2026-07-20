import { Badge } from '../../ui';
import { Construction } from 'lucide-react';

interface PaginaEnConstruccionProps {
  titulo?: string;
}

export default function PaginaEnConstruccion({ titulo = 'Módulo en construcción' }: PaginaEnConstruccionProps) {
  return (
    <div className="text-center py-20">
      <Construction
        className="mx-auto mb-4"
        style={{ width: 64, height: 64, color: 'var(--color-text-tertiary)' }}
      />
      <h1 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
        {titulo}
      </h1>
      <Badge variant="outline">Próximamente</Badge>
    </div>
  );
}
