import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { horasEstudianteApi } from '../../../api/horasApi';
import { useExpedienteById } from '../../../hooks/useExpedientes';
import { Card, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../ui';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface RegistroHora {
  id: string;
  fecha: string;
  horas: number;
  descripcionActividad: string;
  tipoRegistro: string;
  validadoPorTutor: boolean;
  observacionesTutor?: string;
}

export default function ValidacionHorasTutor() {
  const { idExpediente } = useParams<{ idExpediente: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expediente } = useExpedienteById(idExpediente);
  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['horas', 'registros', idExpediente],
    queryFn: async () => {
      const res = await horasEstudianteApi.getRegistros(idExpediente!);
      const payload = res.data?.data as RegistroHora[] | undefined;
      return Array.isArray(payload) ? payload : [];
    },
    enabled: !!idExpediente,
  });

  const validarMutation = useMutation({
    mutationFn: ({ idRegistro, payload }: { idRegistro: string; payload: { validado: boolean; observaciones?: string } }) =>
      horasEstudianteApi.validar(idRegistro, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horas', 'registros', idExpediente] });
      queryClient.invalidateQueries({ queryKey: ['horas', 'control', idExpediente] });
      queryClient.invalidateQueries({ queryKey: ['horas', 'cumplimiento', idExpediente] });
    },
  });

  const handleValidar = async (registro: RegistroHora, validado: boolean) => {
    const { value: observaciones } = await MySwal.fire({
      title: validado ? 'Validar registro de horas' : 'Rechazar registro de horas',
      input: 'textarea',
      inputLabel: 'Observaciones (opcional)',
      inputPlaceholder: 'Ingrese observaciones sobre el registro...',
      showCancelButton: true,
      confirmButtonText: validado ? 'Validar' : 'Rechazar',
      cancelButtonText: 'Cancelar',
    });
    if (observaciones === undefined) return;
    try {
      await validarMutation.mutateAsync({
        idRegistro: registro.id,
        payload: { validado, observaciones: observaciones || '' },
      });
      MySwal.fire({
        icon: 'success',
        title: validado ? 'Registro validado' : 'Registro rechazado',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const error = err as { response?: { data?: { mensaje?: string; message?: string } } };
      MySwal.fire('Error', error.response?.data?.mensaje || error.response?.data?.message || 'No se pudo procesar el registro.', 'error');
    }
  };

  const pendientes = registros.filter((r) => !r.validadoPorTutor);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tutor/practicantes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Validación de horas</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {expediente?.nombreEstudiante} {expediente?.apellidoEstudiante} — {expediente?.codigoExpediente}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-[var(--color-muted-foreground)]">Total de registros</p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">{registros.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-muted-foreground)]">Pendientes de validación</p>
          <p className="text-2xl font-semibold text-[var(--color-warning)]">{pendientes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-muted-foreground)]">Validados</p>
          <p className="text-2xl font-semibold text-[var(--color-success)]">{registros.length - pendientes.length}</p>
        </Card>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--color-muted-foreground)]">
            No hay registros de horas para este expediente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((registro) => (
                <TableRow key={registro.id}>
                  <TableCell>{registro.fecha}</TableCell>
                  <TableCell>{registro.horas}</TableCell>
                  <TableCell>{registro.descripcionActividad}</TableCell>
                  <TableCell>{registro.tipoRegistro}</TableCell>
                  <TableCell>
                    <Badge variant={registro.validadoPorTutor ? 'success' : 'neutral'} size="sm">
                      {registro.validadoPorTutor ? 'Validado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!registro.validadoPorTutor && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleValidar(registro, false)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleValidar(registro, true)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
