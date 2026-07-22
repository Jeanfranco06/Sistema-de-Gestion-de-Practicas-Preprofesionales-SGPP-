import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/ui';
import { horasEstudianteApi } from '@/api/horasApi';

interface Expediente {
  id: string;
  codigoExpediente: string;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  estado: string;
  nombreEmpresa?: string;
}

interface ControlHora {
  id: string;
  horasAcumuladas: number;
  horasRequeridas: number;
}

interface ExpedienteConControl extends Expediente {
  controlHora?: ControlHora;
}

export default function ListaValidacionHoras() {
  const navigate = useNavigate();

  const { data: expedientes = [], isLoading } = useQuery({
    queryKey: ['tutor', 'expedientes-pendientes'],
    queryFn: async () => {
      const res = await horasEstudianteApi.getExpedientesPendientesTutor();
      return res.data?.data as ExpedienteConControl[] || [];
    },
  });

  return (
    <div className="space-y-6 animate-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Validación de Horas</h1>
          <p className="text-sm text-muted-foreground">
            Revisa y valida los registros de horas de tus practicantes
          </p>
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary-700 dark:text-primary-400" />
            <h2 className="text-base font-bold text-foreground">Practicantes con registros pendientes</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 rounded-full border-border border-t-primary-600" />
            </div>
          ) : expedientes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground mb-1">Sin registros pendientes</h3>
              <p className="text-sm text-muted-foreground">
                No hay registros de horas pendientes de validación.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-foreground">Expediente</TableHead>
                    <TableHead className="text-foreground">Estudiante</TableHead>
                    <TableHead className="text-foreground">Empresa</TableHead>
                    <TableHead className="text-foreground">Horas Validadas</TableHead>
                    <TableHead className="text-foreground">Estado</TableHead>
                    <TableHead className="text-right text-foreground">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expedientes.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-foreground font-medium">{exp.codigoExpediente}</TableCell>
                      <TableCell className="text-foreground">
                        {exp.nombreEstudiante} {exp.apellidoEstudiante}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{exp.nombreEmpresa || '-'}</TableCell>
                      <TableCell className="text-foreground">
                        {exp.controlHora?.horasAcumuladas || 0} / {exp.controlHora?.horasRequeridas || 360}
                      </TableCell>
                      <TableCell>
                        <Badge variant={exp.estado === 'EN_EJECUCION' ? 'success' : 'neutral'} size="sm">
                          {exp.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => navigate(`/tutor/horas/${exp.id}`)}>
                          Validar
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
