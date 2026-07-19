import { z } from 'zod/v4';

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido').min(1, 'El correo es requerido'),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const usuarioSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  email: z.string().email('Correo inválido'),
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres').optional(),
  rol: z.string().min(1, 'Rol requerido'),
  activo: z.boolean().default(true),
});
export type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const expedienteSchema = z.object({
  codigoTipoPractica: z.string().min(1, 'Tipo de práctica requerido'),
  sedeId: z.string().min(1, 'Sede requerida'),
});
export type ExpedienteFormData = z.infer<typeof expedienteSchema>;

export const horasSchema = z.object({
  fecha: z.string().min(1, 'Fecha requerida'),
  horaInicio: z.string().min(1, 'Hora de inicio requerida'),
  horaFin: z.string().min(1, 'Hora de fin requerida'),
  descripcion: z.string().min(1, 'Descripción requerida').max(500, 'Máximo 500 caracteres'),
}).refine(
  (data) => {
    if (!data.horaInicio || !data.horaFin) return true;
    return data.horaInicio < data.horaFin;
  },
  { message: 'La hora de fin debe ser posterior a la de inicio', path: ['horaFin'] }
);
export type HorasFormData = z.infer<typeof horasSchema>;

export const planSchema = z.object({
  objetivos: z.string().min(10, 'Describe los objetivos (mín. 10 caracteres)'),
  actividades: z.string().min(10, 'Describe las actividades (mín. 10 caracteres)'),
  cronograma: z.string().min(10, 'Describe el cronograma (mín. 10 caracteres)'),
});
export type PlanFormData = z.infer<typeof planSchema>;

export const evaluacionSchema = z.object({
  puntualidad: z.number().min(0).max(20),
  responsabilidad: z.number().min(0).max(20),
  calidadTrabajo: z.number().min(0).max(20),
  iniciativa: z.number().min(0).max(20),
  trabajoEquipo: z.number().min(0).max(20),
  observaciones: z.string().max(1000).optional(),
});
export type EvaluacionFormData = z.infer<typeof evaluacionSchema>;

export const perfilAcademicoSchema = z.object({
  codigoUniversitario: z.string().min(1, 'Código universitario requerido'),
  escuela: z.string().min(1, 'Escuela requerida'),
  cicloActual: z.string().min(1, 'Ciclo actual requerido'),
  creditosAprobados: z.coerce.number().min(0, 'Debe ser un número positivo'),
});
export type PerfilAcademicoFormData = z.infer<typeof perfilAcademicoSchema>;
