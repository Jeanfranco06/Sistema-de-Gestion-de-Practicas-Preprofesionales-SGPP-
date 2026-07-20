import { Drawer } from '@mui/material';
import {
  X,
  Building2,
  MapPin,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Card } from '@/ui';

export interface SedeDetalle {
  id: string;
  nombreSede: string;
  razonSocialEmpresa: string;
  empresaRuc?: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  tipoEntidad: string;
  esElegible?: boolean;
  activo?: boolean;
  capacidadMaxima?: number | string;
  descripcionActividades?: string;
}

interface SedeDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  sede: SedeDetalle | null;
}

export const SedeDetailsDrawer = ({ open, onClose, sede }: SedeDetailsDrawerProps) => {
  if (!sede) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div
        className="w-[300px] sm:w-[400px] md:w-[500px] p-6 h-full overflow-y-auto"
        role="presentation"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-primary-600)' }}
          >
            Detalles de la Sede
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" style={{ color: 'var(--color-foreground)' }} />
          </button>
        </div>

        <hr className="mb-6" style={{ borderColor: 'var(--color-border)' }} />

        <div className="space-y-6">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--color-muted)',
              borderRadius: 'var(--radius-2xl)',
            }}
          >
            <div className="flex items-center mb-2">
              <Building2
                className="h-5 w-5 mr-2"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
                {sede.razonSocialEmpresa}
              </h3>
            </div>
            <p
              className="text-sm ml-7"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              RUC: {sede.empresaRuc || 'No especificado'}
            </p>
          </div>

          <div>
            <div className="flex items-start mb-2">
              <MapPin
                className="h-5 w-5 mr-2 mt-0.5"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Sede: {sede.nombreSede}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {sede.direccion}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {sede.distrito}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Users
                className="h-5 w-5 mr-2"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Capacidad Máxima
                </p>
                <p className="font-medium" style={{ color: 'var(--color-foreground)' }}>
                  {sede.capacidadMaxima || 'No especificada'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <ShieldCheck
                className="h-5 w-5 mr-2"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Estado
                </p>
                <Badge variant={sede.activo ? 'success' : 'neutral'} size="sm">
                  {sede.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Descripción de Actividades
            </p>
            <Card
              className="p-4"
              style={{ backgroundColor: '#fafafa', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                {sede.descripcionActividades || 'No hay descripción detallada de actividades para esta sede.'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
