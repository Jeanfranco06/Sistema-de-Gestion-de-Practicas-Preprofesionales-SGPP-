import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Drawer from '@mui/material/Drawer';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
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
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * Math.random()));
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
        MySwal.fire({ icon: 'success', title: 'Usuario Creado', text: `Se ha creado el usuario @${finalPayload.username} exitosamente.`, timer: 2500, showConfirmButton: false });
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

  if (isLoading && usuarios.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '0.75rem' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#1a365d' }} />
        <p style={{ fontWeight: 500, color: 'var(--color-muted-foreground)' }}>Cargando directorio de usuarios...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="space-y-6" style={{ padding: '1rem 1.5rem', width: '100%', paddingBottom: '2rem' }}>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ backgroundColor: '#1a365d', color: 'white', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', right: '-20px', top: '10px', opacity: 0.1, pointerEvents: 'none' }}>
            <Shield style={{ width: 150, height: 150 }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ opacity: 0.8, letterSpacing: '1.5px', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Administración</p>
            <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.375rem' }} className="sm:text-2xl md:text-3xl">Gestión de Usuarios</h2>
            <p style={{ opacity: 0.9 }}>Directorio centralizado de cuentas, roles y accesos al sistema SGPP</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
            <Button variant="primary" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </Button>
            <Tooltip content="Actualizar Directorio">
              <button
                onClick={() => refetch()}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
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
              className="min-w-[140px]"
            />
            <Select
              label="Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={ESTADOS_FILTRO.map((e) => ({
                value: e,
                label: e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase(),
              }))}
              className="min-w-[120px]"
            />
            <Select
              label="Origen"
              value={filtroTipoUsuario}
              onChange={(e) => setFiltroTipoUsuario(e.target.value)}
              options={TIPO_USUARIO_FILTRO.map((t) => ({
                value: t,
                label: t === 'todos' ? 'Todos' : t,
              }))}
              className="min-w-[120px]"
            />
            <Tooltip content="Limpiar filtros">
              <button
                onClick={limpiarFiltros}
                style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.25rem' }}
              >
                <Filter className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', position: 'relative' }}>
          {isLoading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <Progress value={100} size="sm" />
            </div>
          )}
          <div style={{ overflowX: 'auto', opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
            <Table className="min-w-[800px]">
              <TableHeader>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {headCells.map((hc) => (
                    <th
                      key={hc.id}
                      style={{ fontWeight: 700, color: '#475569', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem' }}
                    >
                      {hc.sortable !== false ? (
                        <button
                          onClick={() => handleSort(hc.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#475569', padding: 0, fontSize: '0.875rem' }}
                        >
                          {hc.label}
                          {orderBy === hc.id ? (
                            order === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : null}
                        </button>
                      ) : (
                        hc.label
                      )}
                    </th>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
                {paginatedUsuarios.map((usuario) => (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s' }} className="hover:bg-muted/50">
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Avatar
                          size="md"
                          fallback={getInitials(usuario.nombres, usuario.apellidoPaterno)}
                          style={{
                            backgroundColor: usuario.tipoUsuario === 'EXTERNO' ? '#f0fdf4' : '#eff6ff',
                            color: usuario.tipoUsuario === 'EXTERNO' ? '#166534' : '#1e40af',
                            fontWeight: 700,
                            border: '1px solid',
                            borderColor: usuario.tipoUsuario === 'EXTERNO' ? '#bbf7d0' : '#bfdbfe',
                            width: '40px',
                            height: '40px',
                          }}
                        />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-foreground)' }}>@{usuario.username}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontWeight: 600 }}>{usuario.tipoUsuario}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-foreground)' }}>{`${usuario.nombres} ${usuario.apellidoPaterno}`}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                        {usuario.numeroDocumento ? `${usuario.tipoDocumento}: ${usuario.numeroDocumento}` : 'Sin documento'}
                      </p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>{usuario.email}</p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {(usuario.roles || []).slice(0, 2).map((rol) => {
                          const raw = typeof rol === 'string' ? rol : ((rol as { nombre?: string }).nombre || (rol as { authority?: string }).authority || String(rol));
                          const colorKey = raw.toUpperCase().replace(/^ROLE_/, '');
                          const finalKey = ROLES_DISPONIBLES.find((r) => r.startsWith(colorKey.substring(0, 4))) || colorKey;
                          const bgColor = roleColorMap[finalKey] || '#64748b';
                          return (
                            <span
                              key={raw}
                              style={{
                                fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px',
                                padding: '0.125rem 0.375rem',
                                backgroundColor: `${bgColor}15`, color: bgColor,
                                border: `1px solid ${bgColor}30`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {raw.replace(/_/g, ' ')}
                            </span>
                          );
                        })}
                        {(usuario.roles || []).length > 2 && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: '6px', padding: '0.125rem 0.375rem', backgroundColor: '#f8fafc', color: '#64748b' }}>
                            +{usuario.roles.length - 2}
                          </span>
                        )}
                        {(!usuario.roles || usuario.roles.length === 0) && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>Sin roles</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: '50%',
                              backgroundColor: usuario.activo ? '#10b981' : '#ef4444',
                              boxShadow: `0 0 0 2px ${usuario.activo ? '#d1fae5' : '#fee2e2'}`,
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: usuario.activo ? '#10b981' : '#ef4444' }}>
                            {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                        {usuario.cuentaBloqueada && (
                          <Tooltip content="Cuenta bloqueada">
                            <Lock className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <Tooltip content="Ver Detalle">
                          <button
                            onClick={() => loadDetalle(usuario.id!)}
                            style={{ color: '#64748b', backgroundColor: '#f8fafc', border: 'none', borderRadius: '6px', padding: '0.375rem', cursor: 'pointer', display: 'inline-flex' }}
                            className="hover:bg-muted"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Editar Usuario">
                          <button
                            onClick={() => handleOpenDialog(usuario)}
                            style={{ color: '#64748b', backgroundColor: '#f8fafc', border: 'none', borderRadius: '6px', padding: '0.375rem', cursor: 'pointer', display: 'inline-flex' }}
                            className="hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Gestionar Roles">
                          <button
                            onClick={() => handleOpenRoles(usuario)}
                            style={{ color: '#64748b', backgroundColor: '#f8fafc', border: 'none', borderRadius: '6px', padding: '0.375rem', cursor: 'pointer', display: 'inline-flex' }}
                            className="hover:bg-purple-50"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        {usuario.cuentaBloqueada && (
                          <Tooltip content="Desbloquear">
                            <button
                              onClick={() => handleUnlock(usuario.id!)}
                              style={{ color: '#f59e0b', backgroundColor: '#fffbeb', border: 'none', borderRadius: '6px', padding: '0.375rem', cursor: 'pointer', display: 'inline-flex' }}
                              className="hover:bg-amber-100"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip content={usuario.activo ? 'Deshabilitar' : 'Habilitar'}>
                          <button
                            onClick={() => handleToggleEstado(usuario)}
                            style={{
                              color: usuario.activo ? '#ef4444' : '#10b981',
                              backgroundColor: usuario.activo ? '#fef2f2' : '#ecfdf5',
                              border: 'none', borderRadius: '6px', padding: '0.375rem', cursor: 'pointer', display: 'inline-flex',
                            }}
                            className={usuario.activo ? 'hover:bg-red-100' : 'hover:bg-green-100'}
                          >
                            {usuario.activo ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedUsuarios.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}>
                        <Search className="w-12 h-12" style={{ opacity: 0.5 }} />
                        <p style={{ fontWeight: 600 }}>No se encontraron resultados</p>
                      </div>
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Usuarios por pág:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>{sortedUsuarios.length} total</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.375rem 0.5rem', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, color: 'var(--color-foreground)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Página {page + 1} de {Math.max(1, totalPages)}</span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.375rem 0.5rem', cursor: page + 1 >= totalPages ? 'default' : 'pointer', opacity: page + 1 >= totalPages ? 0.4 : 1, color: 'var(--color-foreground)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* WIZARD DIALOG: Crear / Editar Usuario */}
        <Dialog open={openDialog} onOpenChange={(v) => { if (!v) handleCloseDialog(); }}>
          <DialogContent size="full" className="max-w-2xl">
            <div style={{ backgroundColor: '#1a365d', color: '#fff', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BadgeCheck className="w-5 h-5" />
                <h6 style={{ fontWeight: 700, margin: 0, fontSize: '1.125rem' }}>{isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h6>
              </div>
              <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>Paso {activeStep + 1} de {WIZARD_STEPS.length}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {WIZARD_STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>

            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#fff', minHeight: '350px' }}>
              {/* STEP 0: ROL */}
              {activeStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-muted-foreground)' }}>¿Qué tipo de usuario deseas crear?</p>
                  {errors.rolPrincipal && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle className="w-4 h-4" /> {errors.rolPrincipal}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ROLES_DISPONIBLES.map((rol) => (
                      <Card
                        key={rol}
                        variant="default"
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          borderColor: formData.rolPrincipal === rol ? roleColorMap[rol] : 'var(--color-border)',
                          backgroundColor: formData.rolPrincipal === rol ? `${roleColorMap[rol]}0A` : 'var(--color-card)',
                          borderWidth: formData.rolPrincipal === rol ? 2 : 1,
                        }}
                        onClick={() => { if (!isEditing) setFormData({ ...formData, rolPrincipal: rol }); }}
                      >
                        <CardContent style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%' }}>
                          {rol === 'ESTUDIANTE' && <GraduationCap className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          {rol === 'TUTOR_EXTERNO' && <Building2 className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          {(rol !== 'ESTUDIANTE' && rol !== 'TUTOR_EXTERNO') && <ShieldAlert className="w-8 h-8 mb-1" style={{ color: roleColorMap[rol] }} />}
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: formData.rolPrincipal === rol ? 'var(--color-foreground)' : 'var(--color-muted-foreground)' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h6 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-foreground)', marginBottom: '0.25rem' }}>Datos Personales y Contacto</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input label="Nombres *" value={formData.nombres} onChange={(e) => handleFieldChange('nombres', e.target.value)} onBlur={() => handleBlur('nombres')} error={errors.nombres} />
                    </div>
                    <div>
                      <Input label="Apellido Paterno *" value={formData.apellidoPaterno} onChange={(e) => handleFieldChange('apellidoPaterno', e.target.value)} onBlur={() => handleBlur('apellidoPaterno')} error={errors.apellidoPaterno} />
                    </div>
                    <div>
                      <Input label="Apellido Materno" value={formData.apellidoMaterno} onChange={(e) => handleFieldChange('apellidoMaterno', e.target.value)} />
                    </div>
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
                    <div style={{ gridColumn: 'span 3' }}>
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
                    <div style={{ gridColumn: 'span 4' }}>
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
                          <CheckCircle2 className="absolute right-3 top-[38px] w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem' }}>Debe ser correo institucional @unitru.edu.pe</p>
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h6 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-foreground)', marginBottom: '0.25rem' }}>Perfil: {effectiveFormRole.replace(/_/g, ' ')}</h6>
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
                        <div style={{ gridColumn: '1 / -1' }}>
                          <Input label="Nombre de la Empresa *" value={formData.empresaNombre} onChange={(e) => handleFieldChange('empresaNombre', e.target.value)} onBlur={() => handleBlur('empresaNombre')} error={errors.empresaNombre} />
                        </div>
                        <Input label="Cargo *" value={formData.cargo} onChange={(e) => handleFieldChange('cargo', e.target.value)} onBlur={() => handleBlur('cargo')} error={errors.cargo} />
                        <Input label="Área / Departamento" value={formData.area} onChange={(e) => handleFieldChange('area', e.target.value)} />
                      </>
                    )}
                    {ADMIN_ROLES.includes(effectiveFormRole) && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--color-muted-foreground)' }}>No se requieren datos adicionales para este rol administrativo.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: CREDENCIALES */}
              {activeStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h6 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-foreground)', marginBottom: '0.25rem' }}>Credenciales de Acceso</h6>
                  <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>Estas credenciales permitirán al usuario autenticarse en el sistema SGPP. Puedes autogenerar una contraseña segura si lo deseas.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div style={{ gridColumn: '1 / -1' }}>
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
                          style={{ position: 'absolute', right: '0.75rem', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: 0 }}
                        >
                          {showPassword ? <KeyRound className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </button>
                      </div>
                      {(!isEditing || formData.password) && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Fortaleza de contraseña</span>
                            <span style={{
                              fontWeight: 700, fontSize: '0.75rem',
                              color: calculatePasswordStrength(formData.password) < 50 ? '#ef4444' : calculatePasswordStrength(formData.password) < 75 ? '#f59e0b' : '#10b981',
                            }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <Avatar size="lg" fallback={<CheckCircle2 className="w-6 h-6" />} style={{ backgroundColor: '#1a365d', color: 'white', margin: '0 auto 0.5rem', width: 64, height: 64 }} />
                    <h5 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-foreground)' }}>Casi listo</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>Por favor, verifica los datos ingresados antes de confirmar la creación del usuario.</p>
                  </div>

                  <div style={{ borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Rol: {effectiveFormRole.replace(/_/g, ' ')}</p>
                      <Badge variant="neutral" size="sm">{formData.tipoUsuario}</Badge>
                    </div>
                    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Nombre Completo</span>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formData.nombres} {formData.apellidoPaterno} {formData.apellidoMaterno}</p>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Documento ({formData.tipoDocumento})</span>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formData.numeroDocumento}</p>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Correo Institucional / Contacto</span>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formData.email}</p>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Nombre de Usuario (Login)</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a365d' }}>@{formData.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="ghost" onClick={handleCloseDialog}>Cancelar</Button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    style={{ backgroundColor: '#10b981' }}
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1a365d' }} />
            </div>
          ) : selectedUsuario ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#1a365d', color: 'white', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'inline-flex', marginTop: '0.25rem' }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ opacity: 0.7, fontWeight: 600, letterSpacing: '1px', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Perfil de Usuario</p>
                  <h5 style={{ fontWeight: 800, fontSize: '1.25rem', margin: '0.25rem 0 0.5rem' }}>{selectedUsuario.nombres} {selectedUsuario.apellidoPaterno}</h5>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <Badge variant={selectedUsuario.activo ? 'success' : 'danger'} size="sm">{selectedUsuario.activo ? 'Activo' : 'Inactivo'}</Badge>
                    {selectedUsuario.cuentaBloqueada && <Badge variant="warning" size="sm">Bloqueado</Badge>}
                    <Badge variant="neutral" size="sm">{selectedUsuario.tipoUsuario || '—'}</Badge>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary)' }}>
                    <User className="w-4 h-4" /> Información General
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', display: 'block' }}>Usuario</span>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>@{selectedUsuario.username}</p>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', display: 'block' }}>Documento ({selectedUsuario.tipoDocumento})</span>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedUsuario.numeroDocumento}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', display: 'block' }}>Correo Electrónico</span>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedUsuario.email}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', display: 'block' }}>Teléfono</span>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedUsuario.telefono || 'No registrado'}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary)' }}>
                    <Shield className="w-4 h-4" /> Roles Asignados
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
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
                          style={{
                            fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px',
                            padding: '0.125rem 0.5rem',
                            backgroundColor: `${bgColor}15`, color: bgColor,
                            border: `1px solid ${bgColor}30`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                    {(!selectedUsuario.roles || selectedUsuario.roles.length === 0) && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>Sin roles asignados en el sistema.</p>
                    )}
                  </div>
                </div>

                {selectedUsuario.tipoUsuario === 'INTERNO' && (selectedUsuario.estudiante || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula) && (
                  <div style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e40af' }}>
                      Perfil Académico (Estudiante)
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#60a5fa', display: 'block' }}>Código Matrícula</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e3a8a' }}>
                          {selectedUsuario.estudiante?.codigoEstudiantil || selectedUsuario.estudiante?.codigoMatricula || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula || '—'}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#60a5fa', display: 'block' }}>Semestre Actual</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e3a8a' }}>
                          {selectedUsuario.estudiante?.semestreActual || selectedUsuario.estudiante?.semestre || selectedUsuario.semestre || '—'}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#60a5fa', display: 'block' }}>Créditos Aprobados</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e3a8a' }}>
                          {selectedUsuario.estudiante?.creditosAprobados || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUsuario.tutorExterno && (
                  <div style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#166534' }}>
                      Perfil Empresarial (Tutor Externo)
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#4ade80', display: 'block' }}>Empresa</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#14532d' }}>{selectedUsuario.tutorExterno.empresaNombre}</p>
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#4ade80', display: 'block' }}>Cargo / Área</span>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#14532d' }}>
                          {selectedUsuario.tutorExterno.cargo} {selectedUsuario.tutorExterno.area ? `(${selectedUsuario.tutorExterno.area})` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setDrawerOpen(false); handleOpenRoles(selectedUsuario); }}>
                    <Shield className="w-4 h-4" /> Roles
                  </Button>
                  <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedUsuario); }}>
                    <Pencil className="w-4 h-4" /> Editar
                  </Button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedUsuario.cuentaBloqueada && (
                    <Button variant="primary" style={{ flex: 1, backgroundColor: '#f59e0b', border: 'none' }} onClick={() => { setDrawerOpen(false); handleUnlock(selectedUsuario.id!); }}>
                      <Unlock className="w-4 h-4" /> Desbloquear
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    style={{
                      flex: 1,
                      backgroundColor: selectedUsuario.activo ? '#fee2e2' : '#d1fae5',
                      color: selectedUsuario.activo ? '#dc2626' : '#059669',
                      border: 'none',
                    }}
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
          <DialogContent size="xl" className="max-w-lg">
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h6 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1e293b', margin: 0 }}>Gestionar Permisos</h6>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '1rem' }}>
                Selecciona los roles que definirán el acceso y las funciones de este usuario en el sistema.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ROLES_DISPONIBLES.map((rol) => (
                  <label
                    key={rol}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedRoles.includes(rol) ? `${roleColorMap[rol]}0A` : 'transparent',
                      border: selectedRoles.includes(rol) ? `1px solid ${roleColorMap[rol]}30` : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(rol)}
                      onChange={() => {
                        setSelectedRoles((prev) =>
                          prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
                        );
                      }}
                      style={{ width: '1rem', height: '1rem', borderRadius: '4px', border: '1px solid var(--color-border)', accentColor: roleColorMap[rol] }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <span
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: roleColorMap[rol] || '#64748b', display: 'inline-block',
                        }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-foreground)' }}>{rol.replace(/_/g, ' ')}</span>
                    </div>
                    {ADMIN_ROLES.includes(rol) && (
                      <Badge variant="info" size="sm">Admin</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
