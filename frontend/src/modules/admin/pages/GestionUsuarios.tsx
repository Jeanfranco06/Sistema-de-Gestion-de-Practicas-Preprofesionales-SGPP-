import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Drawer from '@mui/material/Drawer';
import {
  useUsuarios,
  useUsuarioDetalle,
  useCreateUsuario,
  useUpdateUsuario,
  useCambiarEstadoUsuario,
  useUnlockUsuario,
  useAssignRoles,
} from '../../../hooks/useUsuarios';
import { usuariosApi } from '../../../api/usuariosApi';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Badge } from '../../../ui/Badge';
import { Avatar } from '../../../ui/Avatar';
import { Progress } from '../../../ui/Progress';
import { Skeleton } from '../../../ui/Skeleton';
import { Tooltip } from '../../../ui/Tooltip';
import { Card, CardContent } from '../../../ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../ui/Table';
import { Dialog, DialogContent } from '../../../ui/Dialog';
import { Select } from '../../../ui/Select';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Save,
  ArrowLeft,
  CheckCircle2,
  Ban,
  Lock,
  Unlock,
  Shield,
  User,
  GraduationCap,
  Building2,
  ShieldAlert,
  Key,
  KeyRound,
  Filter,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  BadgeCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const MySwal = withReactContent(Swal);

const ROLES_DISPONIBLES = [
  'ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'SECRETARIA',
  'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ADMINISTRADOR', 'ADMIN_SISTEMA',
];
const ADMIN_ROLES = ['SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ADMINISTRADOR', 'ADMIN_SISTEMA'];
const ESTADOS_FILTRO = ['todos', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'];
const TIPO_USUARIO_FILTRO = ['todos', 'INTERNO', 'EXTERNO'];
const TIPO_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'CARNET_EXTRANJERIA'];

interface Usuario {
  id?: string;
  username?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email?: string;
  numeroDocumento?: string;
  tipoDocumento?: string;
  telefono?: string;
  activo?: boolean;
  cuentaBloqueada?: boolean;
  tipoUsuario?: string;
  roles?: (string | { nombre?: string; authority?: string })[];
  rolPrincipal?: string;
  codigoMatricula?: string;
  codigoEstudiantil?: string;
  codigoEstudiante?: string;
  matricula?: string;
  semestre?: string;
  ciclo?: string;
  codigoDocente?: string;
  categoria?: string;
  especialidad?: string;
  departamento?: string;
  empresaNombre?: string;
  cargo?: string;
  area?: string;
  estudiante?: {
    codigoEstudiantil?: string;
    codigoMatricula?: string;
    codigoEstudiante?: string;
    matricula?: string;
    semestreActual?: string;
    semestre?: string;
    ciclo?: string;
    creditosAprobados?: string;
    nombres?: string;
    apellidoPaterno?: string;
  };
  docente?: {
    codigoDocente?: string;
    categoria?: string;
    especialidad?: string;
    departamento?: string;
  };
  tutorExterno?: {
    nombres?: string;
    apellidoPaterno?: string;
    correo?: string;
    telefono?: string;
    empresaNombre?: string;
    razonSocialEmpresa?: string;
    cargo?: string;
    area?: string;
  };
}

interface FormDataState {
  rolPrincipal: string;
  tipoUsuario: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  tipoDocumento: string;
  telefono: string;
  roles: string[];
  codigoMatricula: string;
  semestre: string;
  codigoDocente: string;
  categoria: string;
  especialidad: string;
  departamento: string;
  empresaNombre: string;
  cargo: string;
  area: string;
  enviarBienvenida: boolean;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

const getInitials = (nombre?: string, apellido?: string): string => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

const resolveRoleValue = (values: Record<string, unknown>): string => {
  if (!values) return '';
  const normalize = (raw: unknown): string => {
    if (raw === undefined || raw === null) return '';
    const s = typeof raw === 'string' ? raw : ((raw as Record<string, unknown>).nombre || (raw as Record<string, unknown>).authority || String(raw)) as string;
    const up = String(s).toUpperCase().replace(/^ROLE_/, '');
    if (up.includes('ESTUD')) return 'ESTUDIANTE';
    if (up.includes('DOCENT')) return 'DOCENTE_ASESOR';
    if (up.includes('TUTOR')) return 'TUTOR_EXTERNO';
    if (up.includes('SECRET')) return 'SECRETARIA';
    if (up.includes('COMITE')) return 'COMITE_PRACTICAS';
    if (up.includes('COORD')) return 'COORDINADOR';
    if (up.includes('DIRECT')) return 'DIRECTOR';
    if (up.includes('ADMIN')) return 'ADMIN_SISTEMA';
    return s;
  };
  const rp = values.rolPrincipal;
  if (rp) return normalize(rp);
  const roles = values.roles;
  if (Array.isArray(roles) && roles.length > 0) return normalize(roles[0]);
  if (values.estudiante || values.codigoMatricula) return 'ESTUDIANTE';
  if (values.tutorExterno || values.empresaNombre) return 'TUTOR_EXTERNO';
  return '';
};

const normalizeRole = (role: unknown): string => resolveRoleValue({ rolPrincipal: role });

const normalizeRoles = (roles: unknown[] = []): string[] => {
  if (!Array.isArray(roles)) return [];
  return roles.map(normalizeRole).filter(Boolean);
};

const firstValue = (...values: unknown[]): string =>
  values.find((v) => v !== undefined && v !== null && v !== '') as string ?? '';

const normalizeUsuarioForForm = (usuario: Usuario): FormDataState => {
  const roles = normalizeRoles(usuario.roles);
  const rolPrincipal = roles[0] || resolveRoleValue(usuario as unknown as Record<string, unknown>) || 'ESTUDIANTE';
  const estudiante = usuario.estudiante || {};
  const docente = usuario.docente || {};
  const tutor = usuario.tutorExterno || {};

  return {
    rolPrincipal,
    username: usuario.username || '',
    password: '',
    confirmPassword: '',
    email: usuario.email || tutor.correo || '',
    nombres: usuario.nombres || estudiante.nombres || tutor.nombres || '',
    apellidoPaterno: usuario.apellidoPaterno || estudiante.apellidoPaterno || tutor.apellidoPaterno || '',
    apellidoMaterno: usuario.apellidoMaterno || estudiante.apellidoMaterno || tutor.apellidoMaterno || '',
    numeroDocumento: usuario.numeroDocumento || '',
    tipoDocumento: String(usuario.tipoDocumento || 'DNI'),
    telefono: usuario.telefono || tutor.telefono || '',
    roles: roles.length ? roles : [rolPrincipal],
    tipoUsuario: String(usuario.tipoUsuario || (rolPrincipal === 'TUTOR_EXTERNO' ? 'EXTERNO' : 'INTERNO')),
    codigoMatricula: String(firstValue(usuario.codigoMatricula, estudiante.codigoEstudiantil, estudiante.codigoMatricula, usuario.codigoEstudiantil)),
    semestre: String(firstValue(usuario.semestre, estudiante.semestreActual, estudiante.semestre)),
    codigoDocente: String(firstValue(usuario.codigoDocente, docente.codigoDocente)),
    categoria: String(firstValue(usuario.categoria, docente.categoria)),
    especialidad: String(firstValue(usuario.especialidad, docente.especialidad)),
    departamento: String(firstValue(usuario.departamento, docente.departamento)),
    empresaNombre: String(firstValue(usuario.empresaNombre, tutor.empresaNombre, tutor.razonSocialEmpresa)),
    cargo: String(firstValue(usuario.cargo, tutor.cargo)),
    area: String(firstValue(usuario.area, tutor.area)),
    enviarBienvenida: false,
  };
};

const roleColorMap: Record<string, string> = {
  ESTUDIANTE: '#3b82f6',
  DOCENTE_ASESOR: '#8b5cf6',
  TUTOR_EXTERNO: '#10b981',
  SECRETARIA: '#f59e0b',
  COMITE_PRACTICAS: '#0ea5e9',
  COORDINADOR: '#6366f1',
  DIRECTOR: '#ef4444',
  ADMIN_SISTEMA: '#dc2626',
};

const WIZARD_STEPS = ['Selección de Rol', 'Datos Personales', 'Datos Específicos', 'Credenciales', 'Resumen'];

const initialFormData: FormDataState = {
  rolPrincipal: '', tipoUsuario: 'INTERNO',
  username: '', password: '', confirmPassword: '', email: '', nombres: '',
  apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '',
  tipoDocumento: 'DNI', telefono: '', roles: [],
  codigoMatricula: '', semestre: '', codigoDocente: '', categoria: '',
  especialidad: '', departamento: '',
  empresaNombre: '', cargo: '', area: '',
  enviarBienvenida: false,
};

function GestionUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('username');

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroTipoUsuario, setFiltroTipoUsuario] = useState('todos');

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [openRolDialog, setOpenRolDialog] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const asyncTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const ASYNC_CHECK_FIELDS = ['username', 'email', 'numeroDocumento', 'codigoMatricula', 'codigoDocente'];
  const fieldLabelMap: Record<string, string> = {
    username: 'nombre de usuario',
    email: 'correo electrónico',
    numeroDocumento: 'número de documento',
    codigoMatricula: 'código de matrícula',
    codigoDocente: 'código docente',
  };

  const buildFilterParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.nombre = debouncedSearch;
    if (filtroEstado !== 'todos') params.estado = filtroEstado;
    if (filtroRol !== 'todos') params.rol = filtroRol;
    if (filtroTipoUsuario !== 'todos') params.tipoUsuario = filtroTipoUsuario;
    return params;
  }, [debouncedSearch, filtroEstado, filtroRol, filtroTipoUsuario]);

  const { data: usuarios = [], isLoading, refetch } = useUsuarios(buildFilterParams());

  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const cambiarEstado = useCambiarEstadoUsuario();
  const unlockUsuario = useUnlockUsuario();
  const assignRoles = useAssignRoles();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timers = asyncTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const scheduleAsyncCheck = useCallback((field: string, value: string) => {
    if (asyncTimers.current[field]) {
      clearTimeout(asyncTimers.current[field]);
    }
    if (!value?.trim()) return;
    asyncTimers.current[field] = setTimeout(async () => {
      if (formData[field as keyof FormDataState] !== value) return;
      try {
        const res = await usuariosApi.checkField(field, value.trim(), isEditing ? currentId : undefined);
        const available = (res.data as { data?: boolean })?.data;
        setErrors((prev) => {
          const next = { ...prev };
          if (!available) {
            next[field] = `El ${fieldLabelMap[field] || field} ya está registrado`;
          } else if (prev[field] && !validateField(field, { ...formData, isEditing })) {
            delete next[field];
          }
          return next;
        });
      } catch {
        // Silently ignore network errors
      }
    }, 600);
  }, [formData, isEditing, currentId]);

  const loadDetalle = async (id: string) => {
    setDetalleLoading(true);
    try {
      const res = await usuariosApi.getDetalle(id);
      setSelectedUsuario(res.data?.data ?? null);
      setDrawerOpen(true);
    } catch {
      MySwal.fire('Error', 'No se pudo cargar el detalle del usuario.', 'error');
    } finally {
      setDetalleLoading(false);
    }
  };

  const [detalleLoading, setDetalleLoading] = useState(false);

  const handleOpenDialog = async (usuario?: Usuario | null) => {
    if (usuario) {
      setIsEditing(true);
      setCurrentId(usuario.id || null);
      let userData: Usuario = usuario;
      try {
        if (usuario.id) {
          const res = await usuariosApi.getDetalle(usuario.id);
          if (res?.data?.data) userData = res.data.data;
        }
      } catch {
        userData = usuario;
      }
      setFormData(normalizeUsuarioForForm(userData));
      setActiveStep(1);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ ...initialFormData });
      setActiveStep(0);
    }
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = async () => {
    if (activeStep > 0 && !isEditing) {
      const result = await MySwal.fire({
        title: '¿Descartar progreso?',
        text: 'Si cierras ahora perderás los datos ingresados en el formulario.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#dc2626',
      });
      if (!result.isConfirmed) return;
    }
    setOpenDialog(false);
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return 'El correo es obligatorio.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return 'Formato de correo inválido.';
    if (!email.toLowerCase().endsWith('@unitru.edu.pe')) {
      return 'Debe usar su correo institucional (@unitru.edu.pe).';
    }
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username?.trim()) return 'El nombre de usuario es obligatorio.';
    if (username.includes(' ')) return 'El nombre de usuario no puede contener espacios.';
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) return 'Solo se permiten letras, números, puntos y guiones bajos.';
    if (username.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres.';
    return null;
  };

  const validateDocumento = (tipoDocumento: string, numeroDocumento: string): string | null => {
    if (!numeroDocumento?.trim()) return 'Obligatorio';
    if (tipoDocumento === 'DNI') {
      if (!/^\d{8}$/.test(numeroDocumento)) return 'El DNI debe tener 8 dígitos numéricos.';
    } else if (tipoDocumento === 'CE') {
      if (!/^[A-Za-z0-9]{6,12}$/.test(numeroDocumento)) return 'El carné de extranjería debe tener entre 6 y 12 caracteres alfanuméricos.';
    } else if (tipoDocumento === 'PASAPORTE') {
      if (!/^[A-Za-z0-9]{6,15}$/.test(numeroDocumento)) return 'El pasaporte debe tener entre 6 y 15 caracteres.';
    } else if (tipoDocumento === 'CARNET_EXTRANJERIA') {
      if (!/^[A-Za-z0-9]{6,15}$/.test(numeroDocumento)) return 'El número de carnet de extranjería es inválido.';
    }
    return null;
  };

  const validateSemestre = (semestre: string): string | null => {
    if (!semestre?.trim()) return 'Obligatorio';
    const re = /^\d{1,2}$/;
    if (!re.test(semestre)) return 'Ingresa el ciclo como número. Ej: 6';
    const ciclo = Number(semestre);
    return ciclo >= 1 && ciclo <= 14 ? null : 'El ciclo debe estar entre 1 y 14.';
  };

  const validateField = (field: string, values: Record<string, unknown>): string | null => {
    const effectiveRole = resolveRoleValue(values);
    switch (field) {
      case 'rolPrincipal':
        return !effectiveRole ? 'Seleccione un rol.' : null;
      case 'nombres':
        return !(values.nombres as string)?.trim() ? 'Obligatorio' : null;
      case 'apellidoPaterno':
        return !(values.apellidoPaterno as string)?.trim() ? 'Obligatorio' : null;
      case 'numeroDocumento':
        return validateDocumento(values.tipoDocumento as string, values.numeroDocumento as string);
      case 'email':
        return validateEmail(values.email as string);
      case 'telefono':
        if (!values.telefono) return null;
        return !/^\d{9}$/.test(values.telefono as string) ? 'El teléfono debe tener 9 dígitos numéricos.' : null;
      case 'codigoMatricula':
        if (effectiveRole !== 'ESTUDIANTE') return null;
        if (!(values.codigoMatricula as string)?.trim()) return 'Obligatorio';
        return !/^\d{6,20}$/.test(values.codigoMatricula as string) ? 'El código de matrícula debe tener entre 6 y 20 dígitos.' : null;
      case 'semestre':
        if (effectiveRole !== 'ESTUDIANTE') return null;
        return validateSemestre(values.semestre as string);
      case 'empresaNombre':
        if (effectiveRole !== 'TUTOR_EXTERNO') return null;
        return !(values.empresaNombre as string)?.trim() ? 'Obligatorio' : null;
      case 'cargo':
        if (effectiveRole !== 'TUTOR_EXTERNO') return null;
        return !(values.cargo as string)?.trim() ? 'Obligatorio' : null;
      case 'username':
        return validateUsername(values.username as string);
      case 'password':
        if (!values.password) return values.isEditing ? null : 'Obligatorio';
        return calculatePasswordStrength(values.password as string) < 50 ? 'La contraseña es muy débil' : null;
      case 'confirmPassword':
        if (!(values.confirmPassword as string) && !values.isEditing) return 'Obligatorio';
        if (values.password && values.confirmPassword !== values.password) return 'Las contraseñas no coinciden';
        return null;
      default:
        return null;
    }
  };

  const getActiveStepErrors = (values: Record<string, unknown>): FieldErrors => {
    const temp: FieldErrors = {};
    if (activeStep === 0) {
      temp.rolPrincipal = validateField('rolPrincipal', values);
    }
    if (activeStep === 1) {
      temp.nombres = validateField('nombres', values);
      temp.apellidoPaterno = validateField('apellidoPaterno', values);
      temp.numeroDocumento = validateField('numeroDocumento', values);
      temp.email = validateField('email', values);
      const telefonoError = validateField('telefono', values);
      if (telefonoError) temp.telefono = telefonoError;
    }
    if (activeStep === 2) {
      const effectiveRole = resolveRoleValue(values);
      if (effectiveRole === 'ESTUDIANTE') {
        temp.codigoMatricula = validateField('codigoMatricula', values);
        const semestreError = validateField('semestre', values);
        if (semestreError) temp.semestre = semestreError;
      }
      if (effectiveRole === 'TUTOR_EXTERNO') {
        temp.empresaNombre = validateField('empresaNombre', values);
        temp.cargo = validateField('cargo', values);
      }
    }
    if (activeStep === 3) {
      temp.username = validateField('username', values);
      temp.password = validateField('password', values);
      temp.confirmPassword = validateField('confirmPassword', values);
    }
    Object.keys(temp).forEach((key) => { if (!temp[key]) delete temp[key]; });
    return temp;
  };

  const validateTouchedField = (field: string, values: Record<string, unknown>) => {
    const error = validateField(field, values);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    if (asyncTimers.current[field]) {
      clearTimeout(asyncTimers.current[field]);
    }
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm as FormDataState);

    if (touched[field] || errors[field]) {
      const error = validateField(field, { ...updatedForm, isEditing });
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateTouchedField(field, { ...formData, isEditing });
    if (ASYNC_CHECK_FIELDS.includes(field) && formData[field as keyof FormDataState]?.trim() && !errors[field]) {
      scheduleAsyncCheck(field, formData[field as keyof FormDataState]);
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 25;
    return s;
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);
    let pwd = '';
    for (const value of randomValues) pwd += chars.charAt(value % chars.length);
    pwd += 'A1!';
    setFormData((prev) => ({ ...prev, password: pwd, confirmPassword: pwd }));
  };

  const validateStep = (): boolean => {
    const temp = getActiveStepErrors({ ...formData, isEditing });
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === 1 && !isEditing && !formData.username) {
        const n = formData.nombres.split(' ')[0].toLowerCase();
        const a = formData.apellidoPaterno.toLowerCase();
        setFormData((prev) => ({ ...prev, username: `${n}.${a}` }));
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isEditing && activeStep === 1) return;
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      const {
        rolPrincipal, codigoMatricula, semestre, codigoDocente,
        categoria, especialidad, departamento, empresaNombre, cargo, area,
        ...dataToSend
      } = formData;
      delete (dataToSend as Record<string, unknown>).confirmPassword;

      let finalPayload: Record<string, unknown> = { ...dataToSend };
      if (!isEditing) {
        const rolesToSend = (rolPrincipal ? [rolPrincipal] : formData.roles).filter(Boolean);
        if (rolesToSend.length) finalPayload.roles = rolesToSend;
        finalPayload.tipoUsuario = rolPrincipal === 'TUTOR_EXTERNO' ? 'EXTERNO' : 'INTERNO';
      }
      finalPayload = {
        ...finalPayload,
        codigoMatricula, semestre, codigoDocente, categoria, especialidad,
        departamento, empresaNombre, cargo, area,
      };

      if (isEditing) {
        await updateUsuario.mutateAsync({ id: currentId!, data: finalPayload });
        MySwal.fire({ icon: 'success', title: 'Usuario Actualizado', text: `El usuario ${formData.nombres} ha sido actualizado con éxito.`, timer: 2000, showConfirmButton: false });
      } else {
        await createUsuario.mutateAsync(finalPayload);
        const mensaje = formData.enviarBienvenida
          ? `Se creó @${finalPayload.username} y se envió un enlace para configurar su contraseña.`
          : `Se ha creado el usuario @${finalPayload.username} exitosamente.`;
        MySwal.fire({ icon: 'success', title: 'Usuario Creado', text: mensaje, timer: 2500, showConfirmButton: false });
      }
      setOpenDialog(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al procesar la solicitud';
      MySwal.fire('Error', msg, 'error');
    }
  };

  const handleToggleEstado = async (usuario: Usuario) => {
    const accion = usuario.activo ? 'deshabilitar' : 'habilitar';
    const result = await MySwal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} Usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: usuario.activo ? '#dc2626' : '#2563eb',
      confirmButtonText: `Sí, ${accion}`,
    });
    if (result.isConfirmed) {
      try {
        await cambiarEstado.mutateAsync({ id: usuario.id!, data: { estado: usuario.activo ? 'INACTIVO' : 'ACTIVO' } });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        MySwal.fire('Error', err.response?.data?.message || 'Error', 'error');
      }
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await unlockUsuario.mutateAsync(id);
    } catch {
      MySwal.fire('Error', 'No se pudo desbloquear', 'error');
    }
  };

  const handleOpenRoles = (usuario: Usuario) => {
    setCurrentId(usuario.id || null);
    const normalized = (usuario.roles || []).map((r) =>
      typeof r === 'string' ? r : ((r as { nombre?: string; authority?: string }).nombre || (r as { authority?: string }).authority || String(r))
    );
    setSelectedRoles(normalized);
    setOpenRolDialog(true);
  };

  const handleSaveRoles = async () => {
    try {
      await assignRoles.mutateAsync({ id: currentId!, roles: selectedRoles });
      setOpenRolDialog(false);
    } catch {
      MySwal.fire('Error', 'Error al actualizar roles', 'error');
    }
  };

  const handleSort = (property: string) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroEstado('todos');
    setFiltroRol('todos');
    setFiltroTipoUsuario('todos');
  };

  const sortedUsuarios = useMemo(() => {
    const list = [...usuarios] as Usuario[];
    list.sort((a, b) => {
      let aVal: string | number = (a as Record<string, unknown>)[orderBy] as string || '';
      let bVal: string | number = (b as Record<string, unknown>)[orderBy] as string || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [usuarios, orderBy, order]);

  const paginatedUsuarios = sortedUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const effectiveFormRole = resolveRoleValue(formData as unknown as Record<string, unknown>);

  const headCells = [
    { id: 'username', label: 'Usuario & Tipo' },
    { id: 'nombres', label: 'Nombre Completo' },
    { id: 'email', label: 'Contacto' },
    { id: 'roles', label: 'Roles Asignados' },
    { id: 'activo', label: 'Estado' },
    { id: 'acciones', label: 'Acciones', sortable: false },
  ];

  const totalPages = Math.ceil(sortedUsuarios.length / rowsPerPage);

  const Stepper = ({ activeStep }: { activeStep: number }) => (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((label, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          const isLast = idx === WIZARD_STEPS.length - 1;
          return (
            <div key={label} className={cn('flex flex-col items-center', idx === 0 ? 'items-start' : isLast ? 'items-end' : 'items-center')}>
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors',
                    isActive ? 'bg-primary-600 text-slate-900 border-primary-600 dark:bg-primary-700 dark:border-primary-700' :
                    isCompleted ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700' :
                    'bg-card text-muted-foreground border-border'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                {!isLast && (
                  <div className={cn('h-1 flex-1 mx-2 rounded-full transition-colors', isCompleted ? 'bg-emerald-600 dark:bg-emerald-700' : 'bg-border')} />
                )}
              </div>
              <span className={cn('text-[0.65rem] mt-1.5 font-semibold hidden sm:block', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isLoading && usuarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] flex-col gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-primary-700" />
        <p className="font-medium text-muted-foreground">Cargando directorio de usuarios...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="space-y-6 p-4 pb-8 w-full">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 md:p-8 text-white shadow-lg">
          <div className="absolute right-[-20px] top-[10px] opacity-10 pointer-events-none">
            <Shield className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <p className="opacity-80 tracking-widest font-semibold text-xs uppercase mb-1">Administración</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-1">Gestión de Usuarios</h2>
            <p className="opacity-90">Directorio centralizado de cuentas, roles y accesos al sistema SGPP</p>
          </div>
          <div className="flex gap-2 items-center relative z-10 mt-4">
            <Button variant="primary" onClick={() => handleOpenDialog()} className="bg-white text-[#1A3A6E] hover:bg-white/90 font-bold">
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </Button>
            <Tooltip content="Actualizar Directorio">
              <Button
                variant="ghost"
                onClick={() => refetch()}
                className="h-9 w-9 bg-white/10 text-white border-white/20 hover:bg-white/20 p-0"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <CardContent className="p-0 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              label="Rol Asignado"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos los roles' },
                ...ROLES_DISPONIBLES.map((r) => ({ value: r, label: r.replace(/_/g, ' ') })),
              ]}
              className="min-w-[160px]"
            />
            <Select
              label="Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={ESTADOS_FILTRO.map((e) => ({
                value: e,
                label: e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase(),
              }))}
              className="min-w-[140px]"
            />
            <Select
              label="Origen"
              value={filtroTipoUsuario}
              onChange={(e) => setFiltroTipoUsuario(e.target.value)}
              options={TIPO_USUARIO_FILTRO.map((t) => ({
                value: t,
                label: t === 'todos' ? 'Todos' : t,
              }))}
              className="min-w-[140px]"
            />
            <Tooltip content="Limpiar filtros">
              <Button
                variant="secondary"
                onClick={limpiarFiltros}
                className="h-10 w-10 p-0"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden relative">
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <Progress value={100} size="sm" />
            </div>
          )}
          <div className={cn('overflow-x-auto transition-opacity duration-200', isLoading ? 'opacity-60' : 'opacity-100')}>
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  {headCells.map((hc) => (
                    <TableHead key={hc.id} className="font-bold text-muted-foreground">
                      {hc.sortable !== false ? (
                        <button
                          onClick={() => handleSort(hc.id)}
                          className="inline-flex items-center gap-1 font-bold text-muted-foreground bg-transparent border-none cursor-pointer p-0 text-sm"
                        >
                          {hc.label}
                          {orderBy === hc.id ? (
                            order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : null}
                        </button>
                      ) : (
                        hc.label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          size="md"
                          fallback={getInitials(usuario.nombres, usuario.apellidoPaterno)}
                          className={cn(
                            'border font-bold',
                            usuario.tipoUsuario === 'EXTERNO'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300'
                          )}
                        />
                        <div>
                          <p className="font-bold text-sm text-foreground">@{usuario.username}</p>
                          <p className="text-xs text-muted-foreground font-semibold">{usuario.tipoUsuario}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-sm text-foreground">{`${usuario.nombres} ${usuario.apellidoPaterno}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {usuario.numeroDocumento ? `${usuario.tipoDocumento}: ${usuario.numeroDocumento}` : 'Sin documento'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm text-muted-foreground">{usuario.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(usuario.roles || []).slice(0, 2).map((rol) => {
                          const raw = typeof rol === 'string' ? rol : ((rol as { nombre?: string }).nombre || (rol as { authority?: string }).authority || String(rol));
                          const colorKey = raw.toUpperCase().replace(/^ROLE_/, '');
                          const finalKey = ROLES_DISPONIBLES.find((r) => r.startsWith(colorKey.substring(0, 4))) || colorKey;
                          const bgColor = roleColorMap[finalKey] || '#64748b';
                          return (
                            <span
                              key={raw}
                              className="text-[0.65rem] font-bold rounded-md px-1.5 py-0.5 whitespace-nowrap"
                              style={{ backgroundColor: `${bgColor}15`, color: bgColor, border: `1px solid ${bgColor}30` }}
                            >
                              {raw.replace(/_/g, ' ')}
                            </span>
                          );
                        })}
                        {(usuario.roles || []).length > 2 && (
                          <span className="text-[0.65rem] font-bold rounded-md px-1.5 py-0.5 bg-muted text-muted-foreground">
                            +{usuario.roles.length - 2}
                          </span>
                        )}
                        {(!usuario.roles || usuario.roles.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">Sin roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full inline-block ring-2',
                              usuario.activo ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/50' : 'bg-red-500 ring-red-100 dark:ring-red-900/50'
                            )}
                          />
                          <span className={cn('font-bold text-xs', usuario.activo ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                            {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                        {usuario.cuentaBloqueada && (
                          <Tooltip content="Cuenta bloqueada">
                            <Lock className="w-4 h-4 text-amber-500" />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        <Tooltip content="Ver Detalle">
                          <Button variant="ghost" size="sm" onClick={() => loadDetalle(usuario.id!)} className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar Usuario">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(usuario)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Gestionar Roles">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenRoles(usuario)} className="h-8 w-8 p-0">
                            <Shield className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        {usuario.cuentaBloqueada && (
                          <Tooltip content="Desbloquear">
                            <Button variant="ghost" size="sm" onClick={() => handleUnlock(usuario.id!)} className="h-8 w-8 p-0 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400">
                              <Unlock className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content={usuario.activo ? 'Deshabilitar' : 'Habilitar'}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleEstado(usuario)}
                            className={cn(
                              'h-8 w-8 p-0',
                              usuario.activo ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                            )}
                          >
                            {usuario.activo ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUsuarios.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <Search className="w-12 h-12 opacity-50" />
                        <p className="font-semibold">No se encontraron resultados</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Usuarios por pág:</span>
              <Select
                label=""
                value={String(rowsPerPage)}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                options={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                ]}
                className="w-16"
              />
              <span>{sortedUsuarios.length} total</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>Página {page + 1} de {Math.max(1, totalPages)}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* WIZARD DIALOG */}
        <Dialog open={openDialog} onOpenChange={(v) => { if (!v) handleCloseDialog(); }}>
          <DialogContent size="full" className="max-w-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5" />
                <h2 className="text-lg font-bold">{isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h2>
              </div>
              <span className="text-xs opacity-80">Paso {activeStep + 1} de {WIZARD_STEPS.length}</span>
            </div>

            <div className="bg-muted border-b border-border px-6 py-4">
              <Stepper activeStep={activeStep} />
            </div>

            <div className="p-6 md:p-8 bg-card min-h-[350px]">
              {/* STEP 0: ROL */}
              {activeStep === 0 && (
                <div className="flex flex-col gap-3">
                  <p className="font-bold text-sm text-muted-foreground">¿Qué tipo de usuario deseas crear?</p>
                  {errors.rolPrincipal && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.rolPrincipal}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ROLES_DISPONIBLES.map((rol) => (
                      <Card
                        key={rol}
                        className={cn(
                          'cursor-pointer transition-all duration-200 p-3',
                          formData.rolPrincipal === rol
                            ? 'ring-2 ring-primary-500/20'
                            : 'hover:border-primary-400/50 dark:hover:border-primary-700/50'
                        )}
                        style={{
                          borderColor: formData.rolPrincipal === rol ? roleColorMap[rol] : 'var(--color-border)',
                          backgroundColor: formData.rolPrincipal === rol ? `${roleColorMap[rol]}0A` : 'var(--color-card)',
                          borderWidth: formData.rolPrincipal === rol ? 2 : 1,
                        }}
                        onClick={() => { if (!isEditing) setFormData({ ...formData, rolPrincipal: rol }); }}
                      >
                        <CardContent className="p-0 flex flex-col items-start h-full">
                          {rol === 'ESTUDIANTE' && <GraduationCap className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          {rol === 'TUTOR_EXTERNO' && <Building2 className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          {(rol !== 'ESTUDIANTE' && rol !== 'TUTOR_EXTERNO') && <ShieldAlert className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          <p className={cn('font-bold text-sm', formData.rolPrincipal === rol ? 'text-foreground' : 'text-muted-foreground')}>
                            {rol.replace(/_/g, ' ')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1: DATOS PERSONALES */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-lg text-foreground mb-1">Datos Personales y Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Nombres *" value={formData.nombres} onChange={(e) => handleFieldChange('nombres', e.target.value)} onBlur={() => handleBlur('nombres')} error={errors.nombres} />
                    <Input label="Apellido Paterno *" value={formData.apellidoPaterno} onChange={(e) => handleFieldChange('apellidoPaterno', e.target.value)} onBlur={() => handleBlur('apellidoPaterno')} error={errors.apellidoPaterno} />
                    <Input label="Apellido Materno" value={formData.apellidoMaterno} onChange={(e) => handleFieldChange('apellidoMaterno', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Select
                        label="Tipo Doc."
                        value={formData.tipoDocumento}
                        onChange={(e) => {
                          handleFieldChange('tipoDocumento', e.target.value);
                          setFormData((prev) => ({ ...prev, numeroDocumento: '' }));
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.numeroDocumento;
                            return next;
                          });
                        }}
                        options={TIPO_DOCUMENTO.map((t) => ({ value: t, label: t }))}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Número Documento *"
                        value={formData.numeroDocumento}
                        onChange={(e) => {
                          const value = e.target.value;
                          const filtered = formData.tipoDocumento === 'DNI'
                            ? value.replace(/\D/g, '').slice(0, 8)
                            : value.replace(/[^A-Za-z0-9]/g, '').slice(0, 15);
                          handleFieldChange('numeroDocumento', filtered);
                        }}
                        onBlur={() => handleBlur('numeroDocumento')}
                        error={errors.numeroDocumento}
                        inputMode={formData.tipoDocumento === 'DNI' ? 'numeric' : 'text'}
                        maxLength={formData.tipoDocumento === 'DNI' ? 8 : 15}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div className="md:col-span-4">
                      <div className="relative">
                        <Input
                          label="Correo Electrónico *"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          error={errors.email}
                        />
                        {formData.email && !errors.email && (
                          <CheckCircle2 className="absolute right-3 top-[38px] w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Debe ser correo institucional @unitru.edu.pe</p>
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Teléfono / Celular"
                        value={formData.telefono}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/\D/g, '').slice(0, 9);
                          handleFieldChange('telefono', filtered);
                        }}
                        onBlur={() => handleBlur('telefono')}
                        error={errors.telefono}
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATOS ESPECÍFICOS */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-lg text-foreground mb-1">Perfil: {effectiveFormRole.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {effectiveFormRole === 'ESTUDIANTE' && (
                      <>
                        <Input
                          label="Código de Matrícula *"
                          value={formData.codigoMatricula}
                          onChange={(e) => {
                            const filtered = e.target.value.replace(/\D/g, '').slice(0, 20);
                            handleFieldChange('codigoMatricula', filtered);
                          }}
                          onBlur={() => handleBlur('codigoMatricula')}
                          error={errors.codigoMatricula}
                          inputMode="numeric"
                          maxLength={20}
                        />
                        <Input
                          label="Ciclo / Semestre Actual *"
                          value={formData.semestre}
                          onChange={(e) => handleFieldChange('semestre', e.target.value.replace(/\D/g, '').slice(0, 2))}
                          onBlur={() => handleBlur('semestre')}
                          placeholder="Ej: 6"
                          error={errors.semestre}
                          inputMode="numeric"
                          maxLength={2}
                        />
                      </>
                    )}
                    {effectiveFormRole === 'DOCENTE_ASESOR' && (
                      <>
                        <Input label="Código Docente *" value={formData.codigoDocente} onChange={(e) => handleFieldChange('codigoDocente', e.target.value)} onBlur={() => handleBlur('codigoDocente')} error={errors.codigoDocente} />
                        <Input label="Categoría" value={formData.categoria} onChange={(e) => handleFieldChange('categoria', e.target.value)} placeholder="Ej: Principal, Asociado..." />
                        <Input label="Especialidad" value={formData.especialidad} onChange={(e) => handleFieldChange('especialidad', e.target.value)} placeholder="Ej: Ingeniería de Sistemas" />
                        <Input label="Departamento Académico" value={formData.departamento} onChange={(e) => handleFieldChange('departamento', e.target.value)} placeholder="Ej: Ingeniería Industrial" />
                      </>
                    )}
                    {effectiveFormRole === 'TUTOR_EXTERNO' && (
                      <>
                        <div className="md:col-span-2">
                          <Input label="Nombre de la Empresa *" value={formData.empresaNombre} onChange={(e) => handleFieldChange('empresaNombre', e.target.value)} onBlur={() => handleBlur('empresaNombre')} error={errors.empresaNombre} />
                        </div>
                        <Input label="Cargo *" value={formData.cargo} onChange={(e) => handleFieldChange('cargo', e.target.value)} onBlur={() => handleBlur('cargo')} error={errors.cargo} />
                        <Input label="Área / Departamento" value={formData.area} onChange={(e) => handleFieldChange('area', e.target.value)} />
                      </>
                    )}
                    {ADMIN_ROLES.includes(effectiveFormRole) && (
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">No se requieren datos adicionales para este rol administrativo.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: CREDENCIALES */}
              {activeStep === 3 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-lg text-foreground mb-1">Credenciales de Acceso</h3>
                  <div className="rounded-lg p-3 bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 mb-2">
                    <p className="text-sm text-blue-800 dark:text-blue-300">Estas credenciales permitirán al usuario autenticarse en el sistema SGPP. Puedes autogenerar una contraseña segura si lo deseas.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input label="Nombre de Usuario *" value={formData.username} onChange={(e) => handleFieldChange('username', e.target.value)} onBlur={() => handleBlur('username')} error={errors.username} disabled={isEditing} />
                    </div>
                    <div>
                      <div className="relative">
                        <Input
                          label={isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          onBlur={() => handleBlur('password')}
                          error={errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-[38px] bg-transparent border-none cursor-pointer text-muted-foreground p-0"
                        >
                          {showPassword ? <KeyRound className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                      {(!isEditing || formData.password) && (
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Fortaleza de contraseña</span>
                            <span className={cn(
                              'font-bold text-xs',
                              calculatePasswordStrength(formData.password) < 50 ? 'text-red-600' : calculatePasswordStrength(formData.password) < 75 ? 'text-amber-500' : 'text-emerald-600'
                            )}>
                              {calculatePasswordStrength(formData.password) < 50 ? 'Débil' : calculatePasswordStrength(formData.password) < 75 ? 'Buena' : 'Fuerte'}
                            </span>
                          </div>
                          <Progress value={calculatePasswordStrength(formData.password)} size="sm" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Input
                        label={isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        error={errors.confirmPassword}
                      />
                    </div>
                    {!isEditing && (
                      <div>
                        <Button variant="secondary" onClick={handleGeneratePassword}>
                          <Unlock className="w-4 h-4" /> Autogenerar Contraseña Segura
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: RESUMEN */}
              {activeStep === 4 && (
                <div className="flex flex-col gap-3">
                  <div className="text-center mb-2">
                    <Avatar size="lg" fallback={<CheckCircle2 className="w-6 h-6" />} className="bg-primary-700 text-slate-900 mx-auto mb-2" style={{ width: 64, height: 64 }} />
                    <h3 className="text-xl font-extrabold text-foreground">Casi listo</h3>
                    <p className="text-sm text-muted-foreground">Por favor, verifica los datos ingresados antes de confirmar la creación del usuario.</p>
                  </div>

                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-muted border-b border-border flex justify-between items-center">
                      <p className="font-bold text-sm text-foreground">Rol: {effectiveFormRole.replace(/_/g, ' ')}</p>
                      <Badge variant="neutral" size="sm">{formData.tipoUsuario}</Badge>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-muted-foreground">Nombre Completo</span>
                        <p className="font-semibold text-sm text-foreground">{formData.nombres} {formData.apellidoPaterno} {formData.apellidoMaterno}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground">Documento ({formData.tipoDocumento})</span>
                        <p className="font-semibold text-sm text-foreground">{formData.numeroDocumento}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground">Correo Institucional / Contacto</span>
                        <p className="font-semibold text-sm text-foreground">{formData.email}</p>
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground">Nombre de Usuario (Login)</span>
                        <p className="font-bold text-sm text-primary-700 dark:text-primary-400">@{formData.username}</p>
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <label className="flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm dark:border-primary-800 dark:bg-primary-950/30">
                      <input
                        type="checkbox"
                        checked={formData.enviarBienvenida}
                        onChange={(event) => setFormData((prev) => ({ ...prev, enviarBienvenida: event.target.checked }))}
                        className="mt-0.5 h-4 w-4 accent-primary-700"
                      />
                      <span>
                        <strong className="block text-foreground">Enviar correo de bienvenida</strong>
                        Se enviará el nombre de usuario y un enlace único para que la persona configure su propia contraseña. No se enviará la contraseña por correo.
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted border-t border-border flex justify-between items-center">
              <Button variant="ghost" onClick={handleCloseDialog}>Cancelar</Button>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={activeStep === 0 || createUsuario.isPending || updateUsuario.isPending} onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </Button>
                {activeStep < WIZARD_STEPS.length - 1 ? (
                  <Button variant="primary" onClick={handleNext}>
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={createUsuario.isPending || updateUsuario.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="w-4 h-4" /> {createUsuario.isPending || updateUsuario.isPending ? 'Procesando...' : (isEditing ? 'Confirmar Cambios' : 'Crear Usuario')}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Drawer Detalle */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 480, md: 540 }, borderLeft: 'none', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' } }}
        >
          {detalleLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
            </div>
          ) : selectedUsuario ? (
            <div className="flex flex-col h-full bg-card">
              <div className="px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-900 text-white flex items-start gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setDrawerOpen(false)}
                  className="h-9 w-9 bg-white/10 text-white border-white/20 hover:bg-white/20 p-0 mt-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <p className="opacity-70 font-semibold tracking-wider text-xs uppercase mb-0">Perfil de Usuario</p>
                  <h3 className="text-xl font-extrabold my-1">{selectedUsuario.nombres} {selectedUsuario.apellidoPaterno}</h3>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant={selectedUsuario.activo ? 'success' : 'danger'} size="sm">{selectedUsuario.activo ? 'Activo' : 'Inactivo'}</Badge>
                    {selectedUsuario.cuentaBloqueada && <Badge variant="warning" size="sm">Bloqueado</Badge>}
                    <Badge variant="neutral" size="sm">{selectedUsuario.tipoUsuario || '—'}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <Card className="mb-3">
                  <CardContent className="p-3">
                    <p className="text-sm font-bold mb-2 flex items-center gap-1 text-primary-700 dark:text-primary-400">
                      <User className="w-4 h-4" /> Información General
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground block">Usuario</span>
                        <p className="font-bold text-sm text-foreground">@{selectedUsuario.username}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-muted-foreground block">Documento ({selectedUsuario.tipoDocumento})</span>
                        <p className="font-semibold text-sm text-foreground">{selectedUsuario.numeroDocumento}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-xs text-muted-foreground block">Correo Electrónico</span>
                        <p className="font-semibold text-sm text-foreground">{selectedUsuario.email}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-xs text-muted-foreground block">Teléfono</span>
                        <p className="font-semibold text-sm text-foreground">{selectedUsuario.telefono || 'No registrado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-3">
                  <CardContent className="p-3">
                    <p className="text-sm font-bold mb-2 flex items-center gap-1 text-primary-700 dark:text-primary-400">
                      <Shield className="w-4 h-4" /> Roles Asignados
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedUsuario.roles || []).map((r) => {
                        const raw = typeof r === 'string' ? r : ((r as { nombre?: string }).nombre || (r as { authority?: string }).authority || String(r));
                        const label = String(raw).replace(/_/g, ' ');
                        const key = raw;
                        const colorKey = (typeof r === 'string' ? r : ((r as { nombre?: string }).nombre || (r as { authority?: string }).authority || raw)).toUpperCase().replace(/^ROLE_/, '');
                        const finalKey = ROLES_DISPONIBLES.find((rd) => rd.startsWith(colorKey.substring(0, 4))) || (roleColorMap[colorKey] ? colorKey : '');
                        const bgColor = roleColorMap[finalKey] || '#64748b';
                        return (
                          <span
                            key={key}
                            className="font-bold text-xs rounded-md px-2 py-0.5 whitespace-nowrap"
                            style={{ backgroundColor: `${bgColor}15`, color: bgColor, border: `1px solid ${bgColor}30` }}
                          >
                            {label}
                          </span>
                        );
                      })}
                      {(!selectedUsuario.roles || selectedUsuario.roles.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">Sin roles asignados en el sistema.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedUsuario.tipoUsuario === 'INTERNO' && (selectedUsuario.estudiante || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula) && (
                  <Card className="mb-3 border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800">
                    <CardContent className="p-3">
                      <p className="text-sm font-bold mb-2 text-blue-800 dark:text-blue-300">
                        Perfil Académico (Estudiante)
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 block">Código Matrícula</span>
                          <p className="font-bold text-sm text-blue-900 dark:text-blue-200">
                            {selectedUsuario.estudiante?.codigoEstudiantil || selectedUsuario.estudiante?.codigoMatricula || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 block">Semestre Actual</span>
                          <p className="font-bold text-sm text-blue-900 dark:text-blue-200">
                            {selectedUsuario.estudiante?.semestreActual || selectedUsuario.estudiante?.semestre || selectedUsuario.semestre || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 block">Créditos Aprobados</span>
                          <p className="font-bold text-sm text-blue-900 dark:text-blue-200">
                            {selectedUsuario.estudiante?.creditosAprobados || '—'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedUsuario.tutorExterno && (
                  <Card className="mb-3 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800">
                    <CardContent className="p-3">
                      <p className="text-sm font-bold mb-2 text-emerald-800 dark:text-emerald-300">
                        Perfil Empresarial (Tutor Externo)
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 block">Empresa</span>
                          <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">{selectedUsuario.tutorExterno.empresaNombre}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 block">Cargo / Área</span>
                          <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                            {selectedUsuario.tutorExterno.cargo} {selectedUsuario.tutorExterno.area ? `(${selectedUsuario.tutorExterno.area})` : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="p-3 bg-card border-t border-border flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => { setDrawerOpen(false); handleOpenRoles(selectedUsuario); }}>
                    <Shield className="w-4 h-4" /> Roles
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedUsuario); }}>
                    <Pencil className="w-4 h-4" /> Editar
                  </Button>
                </div>
                <div className="flex gap-2">
                  {selectedUsuario.cuentaBloqueada && (
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 border-none" onClick={() => { setDrawerOpen(false); handleUnlock(selectedUsuario.id!); }}>
                      <Unlock className="w-4 h-4" /> Desbloquear
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className={cn(
                      'flex-1 border-none',
                      selectedUsuario.activo ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    )}
                    onClick={() => { setDrawerOpen(false); handleToggleEstado(selectedUsuario); }}
                  >
                    {selectedUsuario.activo ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {selectedUsuario.activo ? 'Deshabilitar Acceso' : 'Habilitar Acceso'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Drawer>

        {/* Rol Dialog */}
        <Dialog open={openRolDialog} onOpenChange={setOpenRolDialog}>
          <DialogContent size="xl" className="max-w-lg p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-700 dark:text-primary-400" />
              <h3 className="text-lg font-bold text-foreground">Gestionar Permisos</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona los roles que definirán el acceso y las funciones de este usuario en el sistema.
              </p>
              <div className="flex flex-col gap-2">
                {ROLES_DISPONIBLES.map((rol) => (
                  <label
                    key={rol}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-muted',
                      selectedRoles.includes(rol) ? 'bg-muted' : 'bg-transparent'
                    )}
                    style={{
                      border: selectedRoles.includes(rol) ? `1px solid ${roleColorMap[rol]}30` : '1px solid transparent',
                      backgroundColor: selectedRoles.includes(rol) ? `${roleColorMap[rol]}0A` : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(rol)}
                      onChange={() => {
                        setSelectedRoles((prev) =>
                          prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
                        );
                      }}
                      className="w-4 h-4 rounded border-border accent-primary-600"
                      style={{ accentColor: roleColorMap[rol] }}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: roleColorMap[rol] || '#64748b' }} />
                      <span className="font-semibold text-sm text-foreground">{rol.replace(/_/g, ' ')}</span>
                    </div>
                    {ADMIN_ROLES.includes(rol) && (
                      <Badge variant="info" size="sm">Admin</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenRolDialog(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveRoles} loading={assignRoles.isPending}>Guardar Permisos</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

export { GestionUsuarios };
export default GestionUsuarios;
