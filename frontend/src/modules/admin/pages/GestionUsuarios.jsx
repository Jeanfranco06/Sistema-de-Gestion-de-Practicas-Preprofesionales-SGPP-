import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Tooltip,
    TablePagination, MenuItem, Checkbox, ListItemText, OutlinedInput, Select, FormControl, InputLabel,
    Drawer, CircularProgress, LinearProgress, TableSortLabel, Avatar, Stack, Paper, Fade,
    Stepper, Step, StepLabel, Grid, CardActionArea, Card
} from '@mui/material';
import {
    Person as PersonIcon, Edit as EditIcon, LockOpen as LockOpenIcon,
    Search as SearchIcon, Add as AddIcon, FilterList as FilterListIcon, Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon, Block as BlockIcon, Lock as LockIcon,
    AdminPanelSettings as AdminPanelSettingsIcon, ArrowBack as ArrowBackIcon, Save as SaveIcon,
    Refresh as RefreshIcon, Badge as BadgeIcon, NavigateNext as NavigateNextIcon, NavigateBefore as NavigateBeforeIcon,
    School as SchoolIcon, Business as BusinessIcon, Security as SecurityIcon,
    VpnKey as VpnKeyIcon, KeyOff as KeyOffIcon
} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import { usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ROLES_DISPONIBLES = [
    'ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'SECRETARIA',
    'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA'
];
const ADMIN_ROLES = ['SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA'];
const ESTADOS_FILTRO = ['todos', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'];
const TIPO_USUARIO_FILTRO = ['todos', 'INTERNO', 'EXTERNO'];
const TIPO_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'CARNET_EXTRANJERIA'];

const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : '';
    const a = apellido ? apellido.charAt(0).toUpperCase() : '';
    return n + a || '?';
};

const resolveRoleValue = (values) => {
    if (!values) return '';
    const normalize = (raw) => {
        if (!raw && raw !== 0) return '';
        const s = typeof raw === 'string' ? raw : (raw.nombre || raw.authority || String(raw));
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
    if (Array.isArray(roles) && roles.length > 0) {
        const r = roles[0];
        return normalize(r);
    }
    if (values.estudiante || values.codigoMatricula) return 'ESTUDIANTE';
    if (values.tutorExterno || values.empresaNombre) return 'TUTOR_EXTERNO';
    return '';
};

const normalizeRole = (role) => resolveRoleValue({ rolPrincipal: role });

const normalizeRoles = (roles = []) => {
    if (!Array.isArray(roles)) return [];
    return roles.map(normalizeRole).filter(Boolean);
};

const firstValue = (...values) => values.find(value => value !== undefined && value !== null && value !== '') ?? '';

const normalizeUsuarioForForm = (usuario) => {
    const roles = normalizeRoles(usuario.roles);
    const rolPrincipal = roles[0] || resolveRoleValue(usuario) || 'ESTUDIANTE';
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
        codigoMatricula: String(firstValue(
            usuario.codigoMatricula,
            estudiante.codigoEstudiantil,
            estudiante.codigoMatricula,
            usuario.codigoInstitucional
        )),
        semestre: String(firstValue(usuario.semestre, estudiante.semestreActual, estudiante.semestre)),
        codigoDocente: String(firstValue(usuario.codigoDocente, docente.codigoDocente)),
        categoria: String(firstValue(usuario.categoria, docente.categoria)),
        especialidad: String(firstValue(usuario.especialidad, docente.especialidad)),
        departamento: String(firstValue(usuario.departamento, docente.departamento)),
        empresaNombre: String(firstValue(usuario.empresaNombre, tutor.empresaNombre, tutor.razonSocialEmpresa)),
        cargo: String(firstValue(usuario.cargo, tutor.cargo)),
        area: String(firstValue(usuario.area, tutor.area))
    };
};

const roleColorMap = {
    ESTUDIANTE: '#3b82f6', DOCENTE_ASESOR: '#8b5cf6', TUTOR_EXTERNO: '#10b981',
    SECRETARIA: '#f59e0b', COMITE_PRACTICAS: '#0ea5e9', COORDINADOR: '#6366f1',
    DIRECTOR: '#ef4444', ADMIN_SISTEMA: '#dc2626'
};

const DashboardCard = ({ title, action, children, sx }) => (
    <Paper
        elevation={0}
        sx={{
            p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider',
            bgcolor: 'background.paper', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', ...sx
        }}
    >
        {(title || action) && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
                {title && <Typography sx={{ fontWeight: 700 }} variant="h6" color="text.primary">{title}</Typography>}
                {action && <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>{action}</Box>}
            </Box>
        )}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
);

const WIZARD_STEPS = ['Selección de Rol', 'Datos Personales', 'Datos Específicos', 'Credenciales', 'Resumen'];

export const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username');

    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [filtroTipoUsuario, setFiltroTipoUsuario] = useState('todos');

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        rolPrincipal: '', tipoUsuario: 'INTERNO',
        username: '', password: '', confirmPassword: '', email: '', nombres: '',
        apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '',
        tipoDocumento: 'DNI', telefono: '', roles: [],
        codigoMatricula: '', semestre: '', codigoDocente: '', categoria: '',
        especialidad: '', departamento: '',
        empresaNombre: '', cargo: '', area: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const asyncTimers = useRef({});

    const ASYNC_CHECK_FIELDS = ['username', 'email', 'numeroDocumento', 'codigoMatricula', 'codigoDocente'];
    const fieldLabelMap = {
        username: 'nombre de usuario',
        email: 'correo electrónico',
        numeroDocumento: 'número de documento',
        codigoMatricula: 'código de matrícula',
        codigoDocente: 'código docente'
    };

    const scheduleAsyncCheck = (field, value) => {
        if (asyncTimers.current[field]) {
            clearTimeout(asyncTimers.current[field]);
        }
        if (!value?.trim()) return;
        asyncTimers.current[field] = setTimeout(async () => {
            if (formData[field] !== value) return;
            try {
                const res = await usuariosApi.checkField(field, value.trim(), isEditing ? currentId : undefined);
                const available = res.data?.data;
                setErrors(prev => {
                    const next = { ...prev };
                    const existingErr = next[field];
                    if (!available) {
                        next[field] = `El ${fieldLabelMap[field] || field} ya está registrado`;
                    } else if (existingErr && !validateField(field, { ...formData, isEditing })) {
                        delete next[field];
                    }
                    return next;
                });
            } catch {
                // Silently ignore network errors for async check
            }
        }, 600);
    };

    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [detalleLoading, setDetalleLoading] = useState(false);

    const [openRolDialog, setOpenRolDialog] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const buildFilterParams = useCallback(() => {
        const params = {};
        if (searchTerm) params.nombre = searchTerm;
        if (filtroEstado !== 'todos') params.estado = filtroEstado;
        if (filtroRol !== 'todos') params.rol = filtroRol;
        if (filtroTipoUsuario !== 'todos') params.tipoUsuario = filtroTipoUsuario;
        return params;
    }, [searchTerm, filtroEstado, filtroRol, filtroTipoUsuario]);

    const loadUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const params = buildFilterParams();
            const res = await usuariosApi.getAll({ params });
            setUsuarios(res.data.data || []);
        } catch (error) {
            console.error("Error loading usuarios:", error);
            MySwal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, [buildFilterParams]);

    useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

    useEffect(() => {
        const timers = asyncTimers.current;
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { loadUsuarios(); }, 300);
        return () => clearTimeout(timer);
    }, [loadUsuarios]);

    const loadDetalle = async (id) => {
        try {
            setDetalleLoading(true);
            const res = await usuariosApi.getDetalle(id);
            setSelectedUsuario(res.data.data);
            setDrawerOpen(true);
        } catch (error) {
            console.error("Error loading detalle:", error);
            MySwal.fire('Error', 'No se pudo cargar el detalle del usuario.', 'error');
        } finally {
            setDetalleLoading(false);
        }
    };

    const handleOpenDialog = async (usuario = null) => {
        if (usuario) {
            setIsEditing(true);
            setCurrentId(usuario.id);
            let userData = usuario;
            try {
                if (usuario.id) {
                    const res = await usuariosApi.getDetalle(usuario.id);
                    if (res?.data?.data) userData = res.data.data;
                }
            } catch (err) {
                console.error('Error fetching usuario detalle:', err);
                userData = usuario;
            }
            setFormData(normalizeUsuarioForForm(userData));
            setActiveStep(1); // Saltar paso de rol si edita
        } else {
            setIsEditing(false);
            setCurrentId(null);
            setFormData({
                rolPrincipal: '', tipoUsuario: 'INTERNO',
                username: '', password: '', confirmPassword: '', email: '', nombres: '',
                apellidoPaterno: '', apellidoMaterno: '', numeroDocumento: '',
                tipoDocumento: 'DNI', telefono: '', roles: [],
                codigoMatricula: '', semestre: '', codigoDocente: '', categoria: '',
                especialidad: '', departamento: '',
                empresaNombre: '', cargo: '', area: ''
            });
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
                confirmButtonColor: '#dc2626'
            });
            if (!result.isConfirmed) return;
        }
        setOpenDialog(false);
    };

    const validateEmail = (email, _rolPrincipal) => {
        if (!email) return "El correo es obligatorio.";
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return "Formato de correo inválido.";
        if (!email.toLowerCase().endsWith('@unitru.edu.pe')) {
            return "Debe usar su correo institucional (@unitru.edu.pe).";
        }
        return null;
    };

    const validateUsername = (username) => {
        if (!username?.trim()) return "El nombre de usuario es obligatorio.";
        if (username.includes(' ')) return "El nombre de usuario no puede contener espacios.";
        if (!/^[a-zA-Z0-9_.]+$/.test(username)) return "Solo se permiten letras, números, puntos y guiones bajos.";
        if (username.length < 4) return "El nombre de usuario debe tener al menos 4 caracteres.";
        return null;
    };

    const validateDocumento = (tipoDocumento, numeroDocumento) => {
        if (!numeroDocumento?.trim()) return "Obligatorio";
        if (tipoDocumento === 'DNI') {
            if (!/^\d{8}$/.test(numeroDocumento)) return "El DNI debe tener 8 dígitos numéricos.";
        } else if (tipoDocumento === 'CE') {
            if (!/^[A-Za-z0-9]{6,12}$/.test(numeroDocumento)) return "El carné de extranjería debe tener entre 6 y 12 caracteres alfanuméricos.";
        } else if (tipoDocumento === 'PASAPORTE') {
            if (!/^[A-Za-z0-9]{6,15}$/.test(numeroDocumento)) return "El pasaporte debe tener entre 6 y 15 caracteres.";
        } else if (tipoDocumento === 'CARNET_EXTRANJERIA') {
            if (!/^[A-Za-z0-9]{6,15}$/.test(numeroDocumento)) return "El número de carnet de extranjería es inválido.";
        }
        return null;
    };

    const validateSemestre = (semestre) => {
        if (!semestre?.trim()) return "Obligatorio";
        const re = /^\d{1,2}$/;
        if (!re.test(semestre)) return "Ingresa el ciclo como número. Ej: 6";
        const ciclo = Number(semestre);
        return ciclo >= 1 && ciclo <= 14 ? null : "El ciclo debe estar entre 1 y 14.";
    };

    const validateField = (field, values) => {
        const state = values;
        const effectiveRole = resolveRoleValue(state);
        switch (field) {
            case 'rolPrincipal':
                return !effectiveRole ? "Seleccione un rol." : null;
            case 'nombres':
                return !state.nombres?.trim() ? "Obligatorio" : null;
            case 'apellidoPaterno':
                return !state.apellidoPaterno?.trim() ? "Obligatorio" : null;
            case 'numeroDocumento':
                return validateDocumento(state.tipoDocumento, state.numeroDocumento);
            case 'email':
                return validateEmail(state.email, effectiveRole);
            case 'telefono':
                if (!state.telefono) return null;
                return !/^\d{9}$/.test(state.telefono) ? "El teléfono debe tener 9 dígitos numéricos." : null;
            case 'codigoMatricula':
                if (effectiveRole !== 'ESTUDIANTE') return null;
                if (!state.codigoMatricula?.trim()) return "Obligatorio";
                return !/^\d{6,20}$/.test(state.codigoMatricula) ? "El código de matrícula debe tener entre 6 y 20 dígitos." : null;
            case 'semestre':
                if (effectiveRole !== 'ESTUDIANTE') return null;
                return validateSemestre(state.semestre);
            case 'empresaNombre':
                if (effectiveRole !== 'TUTOR_EXTERNO') return null;
                return !state.empresaNombre?.trim() ? "Obligatorio" : null;
            case 'cargo':
                if (effectiveRole !== 'TUTOR_EXTERNO') return null;
                return !state.cargo?.trim() ? "Obligatorio" : null;
            case 'username':
                return validateUsername(state.username);
            case 'password':
                if (!state.password) {
                    return state.isEditing ? null : "Obligatorio";
                }
                return calculatePasswordStrength(state.password) < 50 ? "La contraseña es muy débil" : null;
            case 'confirmPassword':
                if (!state.confirmPassword && !state.isEditing) return "Obligatorio";
                if (state.password && state.confirmPassword !== state.password) return "Las contraseñas no coinciden";
                return null;
            default:
                return null;
        }
    };

    const getActiveStepErrors = (values) => {
        const temp = {};
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
        Object.keys(temp).forEach(key => { if (!temp[key]) delete temp[key]; });
        return temp;
    };

    const validateTouchedField = (field, values) => {
        const error = validateField(field, values);
        setErrors(prev => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
    };

    const handleFieldChange = (field, value) => {
        if (asyncTimers.current[field]) {
            clearTimeout(asyncTimers.current[field]);
        }
        const updatedForm = { ...formData, [field]: value };
        setFormData(updatedForm);

        if (touched[field] || errors[field]) {
            const error = validateField(field, { ...updatedForm, isEditing });
            setErrors(prev => {
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

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateTouchedField(field, { ...formData, isEditing });
        if (ASYNC_CHECK_FIELDS.includes(field) && formData[field]?.trim() && !errors[field]) {
            scheduleAsyncCheck(field, formData[field]);
        }
    };

    const calculatePasswordStrength = (pwd) => {
        let s = 0;
        if (pwd.length >= 8) s += 25;
        if (/[A-Z]/.test(pwd)) s += 25;
        if (/[0-9]/.test(pwd)) s += 25;
        if (/[^A-Za-z0-9]/.test(pwd)) s += 25;
        return s;
    };

    const handleGeneratePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pwd = "";
        for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * Math.random()));
        pwd += "A1!"; // Asegurar al menos una mayúscula, número y especial
        setFormData(prev => ({ ...prev, password: pwd, confirmPassword: pwd }));
    };

    const validateStep = () => {
        const temp = getActiveStepErrors({ ...formData, isEditing });
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (activeStep === 1 && !isEditing && !formData.username) {
                // Autogenerar username
                const n = formData.nombres.split(' ')[0].toLowerCase();
                const a = formData.apellidoPaterno.toLowerCase();
                setFormData(prev => ({ ...prev, username: `${n}.${a}` }));
            }
            setActiveStep(prev => prev + 1);
        }
    };
    const handleBack = () => {
        if (isEditing && activeStep === 1) return;
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        try {
            setIsSubmitting(true);
            const { rolPrincipal, codigoMatricula, semestre, codigoDocente, categoria, especialidad, departamento, empresaNombre, cargo, area, ...dataToSend } = formData;
            delete dataToSend.confirmPassword;

            if (!isEditing) {
                // Ensure we only send valid role strings
                const rolesToSend = (rolPrincipal ? [rolPrincipal] : (formData.roles || [])).filter(Boolean);
                if (rolesToSend.length) dataToSend.roles = rolesToSend;
                dataToSend.tipoUsuario = (rolPrincipal === 'TUTOR_EXTERNO') ? 'EXTERNO' : 'INTERNO';
            }

            // Inclusión de datos dinámicos en el payload (el backend los ignorará si no los soporta aún)
            const finalPayload = {
                ...dataToSend,
                codigoMatricula, semestre, codigoDocente, categoria, especialidad, departamento, empresaNombre, cargo, area
            };

            if (isEditing) {
                await usuariosApi.update(currentId, finalPayload);
                MySwal.fire({ icon: 'success', title: 'Usuario Actualizado', text: `El usuario ${formData.nombres} ha sido actualizado con éxito.`, timer: 2000, showConfirmButton: false });
            } else {
                await usuariosApi.create(finalPayload);
                MySwal.fire({ icon: 'success', title: 'Usuario Creado', text: `Se ha creado el usuario @${finalPayload.username} exitosamente.`, timer: 2500, showConfirmButton: false });
            }
            setOpenDialog(false);
            loadUsuarios();
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Error al procesar la solicitud';
            MySwal.fire('Error', msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (rest of methods handleToggleEstado, handleUnlock, handleSort remain the same logic)
    const handleToggleEstado = async (usuario) => {
        const accion = usuario.activo ? 'deshabilitar' : 'habilitar';
        const result = await MySwal.fire({ title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} Usuario?`, icon: 'warning', showCancelButton: true, confirmButtonColor: usuario.activo ? '#dc2626' : '#2563eb', confirmButtonText: `Sí, ${accion}` });
        if (result.isConfirmed) {
            try {
                await usuariosApi.cambiarEstado(usuario.id, { estado: usuario.activo ? 'INACTIVO' : 'ACTIVO' });
                loadUsuarios();
            } catch (error) { MySwal.fire('Error', error.response?.data?.message || 'Error', 'error'); }
        }
    };
    const handleUnlock = async (id) => {
        try { await usuariosApi.unlock(id); loadUsuarios(); } catch { MySwal.fire('Error', 'No se pudo desbloquear', 'error'); }
    };
    const handleOpenRoles = async (usuario) => {
        setCurrentId(usuario.id);
        // Normalize roles to string identifiers to match Select values
        const normalized = (usuario.roles || []).map(r => typeof r === 'string' ? r : (r.nombre || r.authority || String(r)));
        setSelectedRoles(normalized);
        setOpenRolDialog(true);
    };
    const handleSaveRoles = async () => {
        try {
            await usuariosApi.assignRoles(currentId, selectedRoles);
            setOpenRolDialog(false);
            loadUsuarios();
        } catch { MySwal.fire('Error', 'Error al actualizar roles', 'error'); }
    };
    const handleSort = (property) => { setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc'); setOrderBy(property); };
    const limpiarFiltros = () => { setSearchTerm(''); setFiltroEstado('todos'); setFiltroRol('todos'); setFiltroTipoUsuario('todos'); };

    const sortedUsuarios = useMemo(() => {
        const list = [...usuarios];
        list.sort((a, b) => {
            let aVal = a[orderBy] || ''; let bVal = b[orderBy] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [usuarios, orderBy, order]);
    const paginatedUsuarios = sortedUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const effectiveFormRole = resolveRoleValue(formData);

    const headCells = [
        { id: 'username', label: 'Usuario & Tipo' },
        { id: 'nombres', label: 'Nombre Completo' },
        { id: 'email', label: 'Contacto' },
        { id: 'roles', label: 'Roles Asignados' },
        { id: 'activo', label: 'Estado' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    if (initialLoad) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 3 }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <Typography sx={{ fontWeight: 500 }} variant="body1" color="text.secondary">Cargando directorio de usuarios...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 4 }, width: '100%', pb: 8 }}>
            <Fade in timeout={600}>
                <Box>
                    <Paper elevation={0} sx={{ mb: 4, borderRadius: { xs: 3, md: 4 }, overflow: 'hidden', bgcolor: '#1a365d', color: 'white', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, p: { xs: 3, md: 5 }, gap: { xs: 4, md: 3 }, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', right: { xs: -20, md: 20 }, top: { xs: 10, md: -20 }, opacity: 0.1 }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: { xs: 150, md: 220 } }} />
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5, fontWeight: 600, display: 'block', mb: 0.5 }}>Administración</Typography>
                            <Typography variant="h3"  sx={{ fontWeight: 800,  mt: 0, mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, wordBreak: 'break-word' }}>Gestión de Usuarios</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Directorio centralizado de cuentas, roles y accesos al sistema SGPP</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1, alignSelf: { xs: 'flex-end', md: 'center' } }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: 'white', color: '#1a365d', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 700, borderRadius: 2, px: 3, py: 1.5, whiteSpace: 'nowrap' }}>Nuevo Usuario</Button>
                            <Tooltip title="Actualizar Directorio"><IconButton onClick={loadUsuarios} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><RefreshIcon /></IconButton></Tooltip>
                        </Box>
                    </Paper>

                    <DashboardCard sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField size="small" variant="outlined" placeholder="Buscar por nombre, correo o usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 300 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } } }} />
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                                <InputLabel>Rol Asignado</InputLabel>
                                <Select value={filtroRol} label="Rol Asignado" onChange={(e) => setFiltroRol(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}>
                                    <MenuItem value="todos">Todos los roles</MenuItem>
                                    {ROLES_DISPONIBLES.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: { xs: '47%', sm: 140 } }}>
                                <InputLabel>Estado</InputLabel>
                                <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}>
                                    {ESTADOS_FILTRO.map(e => <MenuItem key={e} value={e}>{e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase()}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: { xs: '47%', sm: 140 } }}>
                                <InputLabel>Origen</InputLabel>
                                <Select value={filtroTipoUsuario} label="Origen" onChange={(e) => setFiltroTipoUsuario(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}>
                                    {TIPO_USUARIO_FILTRO.map(t => <MenuItem key={t} value={t}>{t === 'todos' ? 'Todos' : t}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Tooltip title="Limpiar filtros">
                                <IconButton onClick={limpiarFiltros} sx={{ bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 2, '&:hover': { bgcolor: '#e2e8f0' } }}><FilterListIcon /></IconButton>
                            </Tooltip>
                        </Box>
                    </DashboardCard>

                    <DashboardCard sx={{ p: { xs: 0, sm: 0, md: 0 }, overflow: 'hidden', position: 'relative' }}>
                        {loading && <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}><LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: '#1a365d' }, bgcolor: '#e2e8f0' }} /></Box>}
                        <Box sx={{ overflowX: 'auto', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <TableRow>
                                        {headCells.map((hc) => (
                                            <TableCell key={hc.id} sx={{ fontWeight: 700, color: '#475569', py: 2 }}>
                                                {hc.sortable !== false ? <TableSortLabel active={orderBy === hc.id} direction={orderBy === hc.id ? order : 'asc'} onClick={() => handleSort(hc.id)}>{hc.label}</TableSortLabel> : hc.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedUsuarios.map((usuario) => (
                                        <TableRow key={usuario.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: usuario.tipoUsuario === 'EXTERNO' ? '#f0fdf4' : '#eff6ff', color: usuario.tipoUsuario === 'EXTERNO' ? '#166534' : '#1e40af', fontWeight: 700, border: '1px solid', borderColor: usuario.tipoUsuario === 'EXTERNO' ? '#bbf7d0' : '#bfdbfe' }}>
                                                        {getInitials(usuario.nombres, usuario.apellidoPaterno)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700 }} variant="body2" color="text.primary">@{usuario.username}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>{usuario.tipoUsuario}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 600 }} variant="body2" color="text.primary">{`${usuario.nombres} ${usuario.apellidoPaterno}`}</Typography>
                                                <Typography variant="caption" color="text.secondary">{usuario.numeroDocumento ? `${usuario.tipoDocumento}: ${usuario.numeroDocumento}` : 'Sin documento'}</Typography>
                                            </TableCell>
                                            <TableCell><Typography sx={{ fontWeight: 500 }} variant="body2" color="text.secondary">{usuario.email}</Typography></TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(usuario.roles || []).slice(0, 2).map(rol => (
                                                        <Chip key={rol} label={rol.replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: 1.5, bgcolor: roleColorMap[rol] ? `${roleColorMap[rol]}15` : '#f1f5f9', color: roleColorMap[rol] || '#475569', border: '1px solid', borderColor: roleColorMap[rol] ? `${roleColorMap[rol]}30` : '#e2e8f0' }} />
                                                    ))}
                                                    {(usuario.roles || []).length > 2 && <Chip label={`+${usuario.roles.length - 2}`} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: 1.5, bgcolor: '#f8fafc', color: '#64748b' }} />}
                                                    {(!usuario.roles || usuario.roles.length === 0) && <Typography variant="caption" color="text.disabled" fontStyle="italic">Sin roles</Typography>}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: usuario.activo ? '#10b981' : '#ef4444', boxShadow: `0 0 0 2px ${usuario.activo ? '#d1fae5' : '#fee2e2'}` }} />
                                                        <Typography sx={{ fontWeight: 700 }} variant="caption" color={usuario.activo ? '#10b981' : '#ef4444'}>{usuario.activo ? 'ACTIVO' : 'INACTIVO'}</Typography>
                                                    </Box>
                                                    {usuario.cuentaBloqueada && <Tooltip title="Cuenta bloqueada"><LockIcon sx={{ fontSize: 16, color: '#f59e0b' }} /></Tooltip>}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Ver Detalle" arrow><IconButton size="small" onClick={() => loadDetalle(usuario.id)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#1a365d', bgcolor: '#f1f5f9' } }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Editar Usuario" arrow><IconButton size="small" onClick={() => handleOpenDialog(usuario)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Gestionar Roles" arrow><IconButton size="small" onClick={() => handleOpenRoles(usuario)} sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#8b5cf6', bgcolor: '#f5f3ff' } }}><AdminPanelSettingsIcon fontSize="small" /></IconButton></Tooltip>
                                                    {usuario.cuentaBloqueada && <Tooltip title="Desbloquear" arrow><IconButton size="small" onClick={() => handleUnlock(usuario.id)} sx={{ color: '#f59e0b', bgcolor: '#fffbeb', '&:hover': { color: '#d97706', bgcolor: '#fef3c7' } }}><LockOpenIcon fontSize="small" /></IconButton></Tooltip>}
                                                    <Tooltip title={usuario.activo ? 'Deshabilitar' : 'Habilitar'} arrow><IconButton size="small" onClick={() => handleToggleEstado(usuario)} sx={{ color: usuario.activo ? '#ef4444' : '#10b981', bgcolor: usuario.activo ? '#fef2f2' : '#ecfdf5', '&:hover': { color: usuario.activo ? '#dc2626' : '#059669', bgcolor: usuario.activo ? '#fee2e2' : '#d1fae5' } }}>{usuario.activo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}</IconButton></Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sortedUsuarios.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#94a3b8' }}><SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} /><Typography sx={{ fontWeight: 600 }} variant="subtitle1">No se encontraron resultados</Typography></Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={sortedUsuarios.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="Usuarios por pág:" sx={{ borderTop: '1px solid #e2e8f0' }} />
                    </DashboardCard>
                </Box>
            </Fade>

            {/* WIZARD DIALOG: Crear / Editar Usuario */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}>
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BadgeIcon /> <Typography sx={{ fontWeight: 700 }} variant="h6">{isEditing ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Paso {activeStep + 1} de {WIZARD_STEPS.length}</Typography>
                </DialogTitle>

                <Box sx={{ bgcolor: '#f8fafc', px: { xs: 2, md: 4 }, py: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepIcon-root.Mui-active': { color: '#1a365d' }, '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' } }}>
                        {WIZARD_STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>
                </Box>

                <DialogContent sx={{ p: { xs: 2, md: 5 }, bgcolor: '#fff', minHeight: 350 }}>

                    {/* STEP 0: ROL */}
                    {activeStep === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography sx={{ fontWeight: 700 }} variant="subtitle1" color="text.secondary">¿Qué tipo de usuario deseas crear?</Typography>
                            {errors.rolPrincipal && <Typography color="error" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ErrorIcon fontSize="small" /> {errors.rolPrincipal}</Typography>}
                            <Grid container spacing={2}>
                                {ROLES_DISPONIBLES.map(rol => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rol}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                borderColor: formData.rolPrincipal === rol ? roleColorMap[rol] : '#e2e8f0',
                                                bgcolor: formData.rolPrincipal === rol ? `${roleColorMap[rol]}0A` : '#fff',
                                                transition: 'all 0.2s ease',
                                                borderWidth: formData.rolPrincipal === rol ? 2 : 1
                                            }}
                                        >
                                            <CardActionArea onClick={() => { if (!isEditing) setFormData({ ...formData, rolPrincipal: rol }); }} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                {rol === 'ESTUDIANTE' && <SchoolIcon sx={{ color: roleColorMap[rol], mb: 1, fontSize: 32 }} />}
                                                {rol === 'TUTOR_EXTERNO' && <BusinessIcon sx={{ color: roleColorMap[rol], mb: 1, fontSize: 32 }} />}
                                                {(rol !== 'ESTUDIANTE' && rol !== 'TUTOR_EXTERNO') && <SecurityIcon sx={{ color: roleColorMap[rol], mb: 1, fontSize: 32 }} />}
                                                <Typography sx={{ fontWeight: 700 }} color={formData.rolPrincipal === rol ? 'text.primary' : 'text.secondary'}>
                                                    {rol.replace(/_/g, ' ')}
                                                </Typography>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 1: DATOS PERSONALES */}
                    {activeStep === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 700 }}>Datos Personales y Contacto</Typography>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth label="Nombres *" value={formData.nombres} onChange={e => handleFieldChange('nombres', e.target.value)} onBlur={() => handleBlur('nombres')} error={!!errors.nombres} helperText={errors.nombres} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth label="Apellido Paterno *" value={formData.apellidoPaterno} onChange={e => handleFieldChange('apellidoPaterno', e.target.value)} onBlur={() => handleBlur('apellidoPaterno')} error={!!errors.apellidoPaterno} helperText={errors.apellidoPaterno} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField fullWidth label="Apellido Materno" value={formData.apellidoMaterno} onChange={e => handleFieldChange('apellidoMaterno', e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo Doc.</InputLabel>
                                        <Select value={formData.tipoDocumento} label="Tipo Doc." onChange={e => { handleFieldChange('tipoDocumento', e.target.value); setFormData(prev => ({ ...prev, numeroDocumento: '' })); setErrors(prev => { const next = { ...prev }; delete next.numeroDocumento; return next; }); }}>
                                            {TIPO_DOCUMENTO.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <TextField
                                        fullWidth
                                        label="Número Documento *"
                                        value={formData.numeroDocumento}
                                        onChange={e => {
                                            const value = e.target.value;
                                            const filtered = formData.tipoDocumento === 'DNI'
                                                ? value.replace(/\D/g, '').slice(0, 8)
                                                : value.replace(/[^A-Za-z0-9]/g, '').slice(0, 15);
                                            handleFieldChange('numeroDocumento', filtered);
                                        }}
                                        onBlur={() => handleBlur('numeroDocumento')}
                                        error={!!errors.numeroDocumento}
                                        helperText={errors.numeroDocumento}
                                        slotProps={{
                                            input: {
                                                maxLength: formData.tipoDocumento === 'DNI' ? 8 : 15,
                                                inputMode: formData.tipoDocumento === 'DNI' ? 'numeric' : 'text',
                                                pattern: formData.tipoDocumento === 'DNI' ? '[0-9]*' : undefined
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <TextField
                                        fullWidth label="Correo Electrónico *" type="email" value={formData.email} onChange={e => handleFieldChange('email', e.target.value)} onBlur={() => handleBlur('email')} error={!!errors.email} helperText={errors.email}
                                        slotProps={{
                                            input: {
                                                endAdornment: formData.email && !errors.email ? <InputAdornment position="end"><CheckCircleIcon color="success" fontSize="small" /></InputAdornment> : null
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Debe ser correo institucional @unitru.edu.pe</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono / Celular"
                                        value={formData.telefono}
                                        onChange={e => {
                                            const filtered = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            handleFieldChange('telefono', filtered);
                                        }}
                                        onBlur={() => handleBlur('telefono')}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono}
                                        slotProps={{ input: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 9 } }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 2: DATOS ESPECÍFICOS */}
                    {activeStep === 2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 700 }}>Perfil: {effectiveFormRole.replace(/_/g, ' ')}</Typography>
                            <Grid container spacing={3}>
                                {effectiveFormRole === 'ESTUDIANTE' && (
                                    <>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Código de Matrícula *"
                                                value={formData.codigoMatricula}
                                                onChange={e => {
                                                    const filtered = e.target.value.replace(/\D/g, '').slice(0, 20);
                                                    handleFieldChange('codigoMatricula', filtered);
                                                }}
                                                onBlur={() => handleBlur('codigoMatricula')}
                                                error={!!errors.codigoMatricula}
                                                helperText={errors.codigoMatricula}
                                                slotProps={{ input: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Ciclo / Semestre Actual *"
                                                value={formData.semestre}
                                                onChange={e => handleFieldChange('semestre', e.target.value.replace(/\D/g, '').slice(0, 2))}
                                                onBlur={() => handleBlur('semestre')}
                                                placeholder="Ej: 6"
                                                error={!!errors.semestre}
                                                helperText={errors.semestre}
                                                slotProps={{ input: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2 } }}
                                            />
                                        </Grid>
                                    </>
                                )}
                                {effectiveFormRole === 'DOCENTE_ASESOR' && (
                                    <>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Código Docente *" value={formData.codigoDocente} onChange={e => handleFieldChange('codigoDocente', e.target.value)} onBlur={() => handleBlur('codigoDocente')} error={!!errors.codigoDocente} helperText={errors.codigoDocente} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Categoría" value={formData.categoria} onChange={e => handleFieldChange('categoria', e.target.value)} placeholder="Ej: Principal, Asociado..." />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Especialidad" value={formData.especialidad} onChange={e => handleFieldChange('especialidad', e.target.value)} placeholder="Ej: Ingeniería de Sistemas" />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Departamento Académico" value={formData.departamento} onChange={e => handleFieldChange('departamento', e.target.value)} placeholder="Ej: Ingeniería Industrial" />
                                        </Grid>
                                    </>
                                )}
                                {effectiveFormRole === 'TUTOR_EXTERNO' && (
                                    <>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth label="Nombre de la Empresa *" value={formData.empresaNombre} onChange={e => handleFieldChange('empresaNombre', e.target.value)} onBlur={() => handleBlur('empresaNombre')} error={!!errors.empresaNombre} helperText={errors.empresaNombre} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Cargo *" value={formData.cargo} onChange={e => handleFieldChange('cargo', e.target.value)} onBlur={() => handleBlur('cargo')} error={!!errors.cargo} helperText={errors.cargo} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField fullWidth label="Área / Departamento" value={formData.area} onChange={e => handleFieldChange('area', e.target.value)} />
                                        </Grid>
                                    </>
                                )}
                                {ADMIN_ROLES.includes(effectiveFormRole) && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography color="text.secondary">No se requieren datos adicionales para este rol administrativo.</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 3: CREDENCIALES */}
                    {activeStep === 3 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 700 }}>Credenciales de Acceso</Typography>
                            <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe', mb: 2 }}>
                                <Typography variant="body2" color="#1e40af">Estas credenciales permitirán al usuario autenticarse en el sistema SGPP. Puedes autogenerar una contraseña segura si lo deseas.</Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Nombre de Usuario *" value={formData.username} onChange={e => handleFieldChange('username', e.target.value)} onBlur={() => handleBlur('username')} error={!!errors.username} helperText={errors.username} disabled={isEditing} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth label={isEditing ? "Nueva Contraseña (Opcional)" : "Contraseña *"} type={showPassword ? "text" : "password"}
                                        value={formData.password} onChange={e => handleFieldChange('password', e.target.value)} onBlur={() => handleBlur('password')}
                                        error={!!errors.password} helperText={errors.password}
                                        slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <KeyOffIcon /> : <VpnKeyIcon />}</IconButton></InputAdornment> } }}
                                    />
                                    {(!isEditing || formData.password) && (
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">Fortaleza de contraseña</Typography>
                                                <Typography sx={{ fontWeight: 700 }} variant="caption" color={calculatePasswordStrength(formData.password) < 50 ? 'error' : calculatePasswordStrength(formData.password) < 75 ? 'warning.main' : 'success.main'}>
                                                    {calculatePasswordStrength(formData.password) < 50 ? 'Débil' : calculatePasswordStrength(formData.password) < 75 ? 'Buena' : 'Fuerte'}
                                                </Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={calculatePasswordStrength(formData.password)} color={calculatePasswordStrength(formData.password) < 50 ? 'error' : calculatePasswordStrength(formData.password) < 75 ? 'warning' : 'success'} sx={{ height: 6, borderRadius: 3 }} />
                                        </Box>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField fullWidth label={isEditing ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña *"} type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => handleFieldChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
                                </Grid>
                                {!isEditing && (
                                    <Grid size={{ xs: 12 }}>
                                        <Button variant="outlined" startIcon={<LockOpenIcon />} onClick={handleGeneratePassword} sx={{ borderRadius: 2 }}>Autogenerar Contraseña Segura</Button>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 4: RESUMEN */}
                    {activeStep === 4 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: '#1a365d', mx: 'auto', mb: 2 }}><CheckCircleIcon fontSize="large" /></Avatar>
                                <Typography sx={{ fontWeight: 800 }} variant="h5" color="text.primary">Casi listo</Typography>
                                <Typography variant="body2" color="text.secondary">Por favor, verifica los datos ingresados antes de confirmar la creación del usuario.</Typography>
                            </Box>

                            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontWeight: 700 }} variant="subtitle2">Rol: {effectiveFormRole.replace(/_/g, ' ')}</Typography>
                                    <Chip label={formData.tipoUsuario} size="small" sx={{ fontWeight: 700 }} />
                                </Box>
                                <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                    <Box><Typography sx={{ display: 'block' }} variant="caption" color="text.secondary">Nombre Completo</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{formData.nombres} {formData.apellidoPaterno} {formData.apellidoMaterno}</Typography></Box>
                                    <Box><Typography sx={{ display: 'block' }} variant="caption" color="text.secondary">Documento ({formData.tipoDocumento})</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{formData.numeroDocumento}</Typography></Box>
                                    <Box><Typography sx={{ display: 'block' }} variant="caption" color="text.secondary">Correo Institucional / Contacto</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{formData.email}</Typography></Box>
                                    <Box><Typography sx={{ display: 'block' }} variant="caption" color="text.secondary">Nombre de Usuario (Login)</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#1a365d">@{formData.username}</Typography></Box>
                                </Box>
                            </Paper>
                        </Box>
                    )}

                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button disabled={activeStep === 0 || isSubmitting} onClick={handleBack} startIcon={<NavigateBeforeIcon />} sx={{ fontWeight: 600 }}>Atrás</Button>
                        {activeStep < WIZARD_STEPS.length - 1 ? (
                            <Button variant="contained" onClick={handleNext} endIcon={<NavigateNextIcon />} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#1a365d', '&:hover': { bgcolor: '#1e40af' } }}>Siguiente</Button>
                        ) : (
                            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                                {isSubmitting ? 'Procesando...' : (isEditing ? 'Confirmar Cambios' : 'Crear Usuario')}
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Resto de Dialogs y Drawers permanecen iguales... */}
            {/* ... se omiten aquí por brevedad, el código asume que el resto del archivo (Roles y Drawer) se mantiene intacto. */}

            {/* Drawer Detalle */}
            {/* Aquí reutilizamos el mismo Drawer del código anterior */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 480, md: 540 }, borderLeft: 'none', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' } }}>
                {detalleLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : selectedUsuario ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
                        <Box sx={{ p: 3, bgcolor: '#1a365d', color: 'white', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 600, letterSpacing: 1 }}>Perfil de Usuario</Typography>
                                <Typography variant="h5" sx={{ mt: -0.5, mb: 2, fontWeight: 800 }}>{selectedUsuario.nombres} {selectedUsuario.apellidoPaterno}</Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Chip label={selectedUsuario.activo ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: selectedUsuario.activo ? '#10b981' : '#ef4444', color: 'white', fontWeight: 700, border: 'none' }} />
                                    {selectedUsuario.cuentaBloqueada && <Chip label="Bloqueado" size="small" sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 700, border: 'none' }} />}
                                    <Chip label={selectedUsuario.tipoUsuario || '—'} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontWeight: 600 }} />
                                </Stack>
                            </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                                <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><PersonIcon fontSize="small" /> Información General</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="text.secondary">Usuario</Typography><Typography sx={{ fontWeight: 700 }} variant="body2">@{selectedUsuario.username}</Typography></Box>
                                    <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="text.secondary">Documento ({selectedUsuario.tipoDocumento})</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{selectedUsuario.numeroDocumento}</Typography></Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}><Typography sx={{ fontWeight: 600 }} variant="caption" color="text.secondary">Correo Electrónico</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{selectedUsuario.email}</Typography></Box>
                                    <Box sx={{ gridColumn: '1 / -1' }}><Typography sx={{ fontWeight: 600 }} variant="caption" color="text.secondary">Teléfono</Typography><Typography sx={{ fontWeight: 600 }} variant="body2">{selectedUsuario.telefono || 'No registrado'}</Typography></Box>
                                </Box>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                                <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}><AdminPanelSettingsIcon fontSize="small" /> Roles Asignados</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {(selectedUsuario.roles || []).map(r => {
                                        const raw = typeof r === 'string' ? r : (r.nombre || r.authority || String(r));
                                        const label = String(raw).replace(/_/g, ' ');
                                        const key = (r && (r.id || r.nombre)) || raw;
                                        const colorKey = (typeof r === 'string' ? r : (r.nombre || r.authority || raw));
                                        return (<Chip key={key} label={label} sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: roleColorMap[colorKey] ? `${roleColorMap[colorKey]}15` : '#f1f5f9', color: roleColorMap[colorKey] || '#475569', border: '1px solid', borderColor: roleColorMap[colorKey] ? `${roleColorMap[colorKey]}30` : '#e2e8f0' }} />);
                                    })}
                                    {(!selectedUsuario.roles || selectedUsuario.roles.length === 0) && <Typography variant="body2" color="text.secondary" fontStyle="italic">Sin roles asignados en el sistema.</Typography>}
                                </Box>
                            </Paper>
                            {selectedUsuario.tipoUsuario === 'INTERNO' && (selectedUsuario.estudiante || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula || selectedUsuario.estudiante?.codigoEstudiantil) && (
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff', mb: 3 }}>
                                    <Typography variant="subtitle2" color="#1e40af" sx={{ mb: 2, fontWeight: 700 }}>Perfil Académico (Estudiante)</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="#60a5fa">Código Matrícula</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#1e3a8a">{selectedUsuario.estudiante?.codigoEstudiantil || selectedUsuario.estudiante?.codigoMatricula || selectedUsuario.estudiante?.codigoEstudiante || selectedUsuario.estudiante?.matricula || selectedUsuario.codigoEstudiantil || selectedUsuario.codigoMatricula || selectedUsuario.codigoEstudiante || selectedUsuario.matricula || '—'}</Typography></Box>
                                        <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="#60a5fa">Semestre Actual</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#1e3a8a">{selectedUsuario.estudiante?.semestreActual || selectedUsuario.estudiante?.semestre || selectedUsuario.estudiante?.ciclo || selectedUsuario.semestre || selectedUsuario.ciclo || '—'}</Typography></Box>
                                        <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="#60a5fa">Créditos Aprobados</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#1e3a8a">{selectedUsuario.estudiante?.creditosAprobados || '—'}</Typography></Box>
                                    </Box>
                                </Paper>
                            )}
                            {selectedUsuario.tutorExterno && (
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', mb: 3 }}>
                                    <Typography variant="subtitle2" color="#166534" sx={{ mb: 2, fontWeight: 700 }}>Perfil Empresarial (Tutor Externo)</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                                        <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="#4ade80">Empresa</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#14532d">{selectedUsuario.tutorExterno.empresaNombre}</Typography></Box>
                                        <Box><Typography sx={{ fontWeight: 600 }} variant="caption" color="#4ade80">Cargo / Área</Typography><Typography sx={{ fontWeight: 700 }} variant="body2" color="#14532d">{selectedUsuario.tutorExterno.cargo} {selectedUsuario.tutorExterno.area ? `(${selectedUsuario.tutorExterno.area})` : ''}</Typography></Box>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                        <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" sx={{ flex: 1, borderRadius: 2, fontWeight: 700, borderColor: '#cbd5e1', color: '#475569', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' } }} onClick={() => { setDrawerOpen(false); handleOpenRoles(selectedUsuario); }} startIcon={<AdminPanelSettingsIcon />}>Roles</Button>
                                <Button variant="outlined" sx={{ flex: 1, borderRadius: 2, fontWeight: 700, borderColor: '#cbd5e1', color: '#1a365d', '&:hover': { borderColor: '#1a365d', bgcolor: '#eff6ff' } }} onClick={() => { setDrawerOpen(false); handleOpenDialog(selectedUsuario); }} startIcon={<EditIcon />}>Editar</Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {selectedUsuario.cuentaBloqueada && (
                                    <Button variant="contained" color="warning" onClick={() => { setDrawerOpen(false); handleUnlock(selectedUsuario.id); }} sx={{ flex: 1, borderRadius: 2, fontWeight: 700, boxShadow: 'none' }} startIcon={<LockOpenIcon />}>Desbloquear</Button>
                                )}
                                <Button variant="contained" sx={{ flex: 1, borderRadius: 2, fontWeight: 700, boxShadow: 'none', bgcolor: selectedUsuario.activo ? '#fee2e2' : '#d1fae5', color: selectedUsuario.activo ? '#dc2626' : '#059669', '&:hover': { bgcolor: selectedUsuario.activo ? '#fecaca' : '#bbf7d0', boxShadow: 'none' } }} onClick={() => { setDrawerOpen(false); handleToggleEstado(selectedUsuario); }} startIcon={selectedUsuario.activo ? <BlockIcon /> : <CheckCircleIcon />}>
                                    {selectedUsuario.activo ? 'Deshabilitar Acceso' : 'Habilitar Acceso'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                ) : null}
            </Drawer>

            <Dialog open={openRolDialog} onClose={() => setOpenRolDialog(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}>
                <DialogTitle sx={{ bgcolor: '#f8fafc', color: '#1e293b', py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #e2e8f0' }}><AdminPanelSettingsIcon color="primary" /> <Typography sx={{ fontWeight: 700 }} variant="h6">Gestionar Permisos</Typography></DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Selecciona los roles que definirán el acceso y las funciones de este usuario en el sistema.</Typography>
                    <FormControl fullWidth>
                        <InputLabel>Roles Asignados</InputLabel>
                        <Select multiple value={selectedRoles} onChange={e => setSelectedRoles(e.target.value)} input={<OutlinedInput label="Roles Asignados" />} renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map(v => {
                                    const raw = typeof v === 'string' ? v : (v.nombre || v.authority || String(v));
                                    const label = String(raw).replace(/_/g, ' ');
                                    return <Chip key={raw} label={label} size="small" sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} />;
                                })}
                            </Box>
                        )}>
                            {ROLES_DISPONIBLES.map(r => (<MenuItem key={r} value={r}><Checkbox checked={selectedRoles.indexOf(r) > -1} /><ListItemText primary={r.replace(/_/g, ' ')} /></MenuItem>))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenRolDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveRoles} sx={{ borderRadius: 2, fontWeight: 700 }}>Guardar Permisos</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
