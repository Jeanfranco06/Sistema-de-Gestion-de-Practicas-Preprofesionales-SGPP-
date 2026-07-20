import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../ui';
import { LockKeyhole } from 'lucide-react';

export default function NoAutorizado() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div className="text-center py-20">
      <LockKeyhole
        className="mx-auto mb-4"
        style={{ width: 64, height: 64, color: 'var(--color-red-500)' }}
      />
      <h1 className="text-2xl font-bold mb-2">Acceso no autorizado</h1>
      <p className="mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
        No tienes permisos para ver esta página.
      </p>
      <Button onClick={() => navigate(-1)}>Volver</Button>
      <Button variant="outline" className="ml-2" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
