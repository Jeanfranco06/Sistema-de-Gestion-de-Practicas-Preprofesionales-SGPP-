import { useEffect, useRef, useState } from 'react';
import { Camera, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useActualizarFotoPerfil, useFotoPerfil } from '@/hooks/useUsuarios';
import { updateMe } from '@/api/authService';
import { Avatar, Badge, Button, Card, CardContent, CardTitle, Input } from '@/ui';
import { showError, showSuccess } from '@/lib/toast';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const formatRole = (role: string | { authority?: string; nombre?: string }) => {
  const value = typeof role === 'string' ? role : role.authority || role.nombre || '';
  return value.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase();
};

export function PerfilUsuarioPage() {
  const { user, hasRole, updateUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [persistedPhoto, setPersistedPhoto] = useState<string | null>(null);
  const [personalData, setPersonalData] = useState({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '', email: '', telefono: '',
  });
  const [saving, setSaving] = useState(false);
  const photoQuery = useFotoPerfil(user?.id);
  const updatePhoto = useActualizarFotoPerfil();

  useEffect(() => {
    if (!photoQuery.data) return;
    const url = URL.createObjectURL(photoQuery.data);
    setPersistedPhoto(url);
    return () => URL.revokeObjectURL(url);
  }, [photoQuery.data]);

  useEffect(() => {
    setPersonalData({
      nombres: user?.nombres || '',
      apellidoPaterno: user?.apellidoPaterno || '',
      apellidoMaterno: user?.apellidoMaterno || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
    });
  }, [user]);

  const selectPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showError('Formato no válido', 'Usa una imagen JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      showError('Imagen muy grande', 'El tamaño máximo permitido es 5 MB.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      await updatePhoto.mutateAsync(file);
      showSuccess('Foto actualizada', 'Tu nueva foto de perfil ya está disponible.');
    } catch {
      URL.revokeObjectURL(localUrl);
      setPreview(null);
      showError('No se pudo actualizar la foto', 'Intenta nuevamente en unos momentos.');
    } finally {
      event.target.value = '';
    }
  };

  const fullName = [user?.nombres, user?.apellidoPaterno, user?.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
  const initials = `${user?.nombres?.[0] || ''}${user?.apellidoPaterno?.[0] || user?.username?.[0] || 'U'}`.toUpperCase();
  const isStudent = hasRole('ESTUDIANTE');

  const savePersonalData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateMe(personalData);
      updateUser(response.data);
      showSuccess('Datos actualizados', 'Tu información personal se guardó correctamente.');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      showError('No se pudieron actualizar los datos', message || 'Verifica la información e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 text-white md:p-8">
        <UserRound className="absolute -right-6 -top-8 h-44 w-44 opacity-10 md:h-64 md:w-64" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Cuenta institucional</p>
            <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Mi perfil</h1>
            <p className="mt-2 text-sm text-white/90">Consulta tus datos y administra tu foto de perfil.</p>
          </div>
          {isStudent && (
            <Button variant="ghost" className="border border-white/30 text-white hover:bg-white/10" onClick={() => window.location.assign('/estudiante/perfil')}>
              Perfil académico
            </Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="group relative">
              <Avatar
                size="xl"
                src={preview ?? persistedPhoto ?? undefined}
                alt={fullName || user?.username || 'Usuario'}
                fallback={initials}
                className="h-28 w-28 border-4 border-card text-3xl shadow-lg"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full p-0 shadow-md"
                onClick={() => inputRef.current?.click()}
                loading={updatePhoto.isPending}
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">{fullName || user?.username}</h2>
            <p className="mt-1 text-sm text-muted-foreground">@{user?.username}</p>
            <p className="mt-4 text-xs text-muted-foreground">JPG, PNG o WEBP. Máximo 5 MB.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CardTitle className="mb-2 text-lg">Información personal</CardTitle>
            <p className="mb-5 text-sm text-muted-foreground">Actualiza los datos de contacto de tu cuenta institucional.</p>
            <form className="space-y-5" onSubmit={savePersonalData}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombres" value={personalData.nombres} onChange={(event) => setPersonalData((data) => ({ ...data, nombres: event.target.value }))} required />
                <Input label="Apellido paterno" value={personalData.apellidoPaterno} onChange={(event) => setPersonalData((data) => ({ ...data, apellidoPaterno: event.target.value }))} required />
                <Input label="Apellido materno" value={personalData.apellidoMaterno} onChange={(event) => setPersonalData((data) => ({ ...data, apellidoMaterno: event.target.value }))} />
                <Input label="Teléfono" type="tel" value={personalData.telefono} onChange={(event) => setPersonalData((data) => ({ ...data, telefono: event.target.value }))} helperText="Opcional" />
                <div className="sm:col-span-2">
                  <Input label="Correo institucional" type="email" leftIcon={<Mail className="h-4 w-4" />} value={personalData.email} onChange={(event) => setPersonalData((data) => ({ ...data, email: event.target.value }))} required />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><UserRound className="h-4 w-4" /> Usuario institucional</p>
                <p className="mt-2 break-all text-sm font-semibold text-foreground">{user?.username || 'No disponible'}</p>
                <p className="mt-1 text-xs text-muted-foreground">El usuario, documento, roles y estado de la cuenta son administrados por Secretaría.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Roles asignados</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user?.roles?.length ? user.roles.map((role, index) => <Badge key={`${formatRole(role)}-${index}`} variant="info">{formatRole(role)}</Badge>) : <span className="text-sm text-muted-foreground">Sin roles registrados</span>}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={saving}>Guardar cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
