import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Pencil, Trash2, Search, Plus, Filter, RefreshCw, Building, Eye, ClipboardCheck, Users,
    GraduationCap, CheckCircle2, XCircle, AlertTriangle, Building2, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel,
    LinearProgress, CircularProgress, Drawer, Divider, Alert, MenuItem, type AlertColor
} from '@mui/material';
import { sedeApi, empresaApi } from '../../../api/sedesApi';
import { validacionApi } from '../../../api/validacionesApi';
import { useAuth } from '../../../auth/AuthContext';
import Swal from 'sweetalert2';
import { showSuccess, showError, showWarning, showInfo, showLoading, closeLoading } from '../../../lib/toast';
import {
    Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    Select, Avatar, Tooltip, type BadgeProps
} from '../../../ui';

const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) || '';
    const second = parts.length > 1 ? parts[1]?.charAt(0) || '' : '';
    return (first + second).toUpperCase() || '?';
};

const statusColorMap = {
    ACTIVA: { dot: '#10b981', shadow: '#d1fae5', label: 'Activa' },
    INACTIVA: { dot: '#ef4444', shadow: '#fee2e2', label: 'Inactiva' }
} as const;

interface Empresa {
    id: number;
    razonSocial: string;
    ruc?: string;
    activo?: boolean;
}

interface TutorActivo {
    id: number;
    nombres: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    cargo?: string;
    correo?: string;
    telefono?: string;
}

interface SedeCatalogo {
    id: number;
    nombreSede: string;
    direccion?: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
    telefono?: string;
    email?: string;
    estadoSede: 'ACTIVA' | 'INACTIVA';
    razonSocialEmpresa?: string;
    resultadoValidacion?: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
    tieneValidacionVigente?: boolean;
    tieneConvenioVigente?: boolean;
    tieneTutorActivo?: boolean;
    esElegible?: boolean;
    motivoNoElegible?: string;
    capacidadMaxima?: number;
    activo?: boolean;
}

interface SedeDetalle {
    id: number;
    empresaId?: number;
    nombreSede: string;
    direccion?: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
    telefono?: string;
    email?: string;
    nombreContacto?: string;
    cargoContacto?: string;
    telefonoContacto?: string;
    emailContacto?: string;
    capacidadMaxima?: number;
    tipoEntidad?: string;
    areaDisponible?: string;
    descripcion?: string;
    actividadesPrincipales?: string;
    riesgosRelevantes?: string;
    nombreTutorEmpresa?: string;
    cargoTutorEmpresa?: string;
    correoTutorEmpresa?: string;
    telefonoTutorEmpresa?: string;
    estadoSede?: 'ACTIVA' | 'INACTIVA';
    esElegible?: boolean;
    motivoNoElegible?: string;
    razonSocialEmpresa?: string;
    fechaVigenciaConvenio?: string;
    fechaVigenciaValidacion?: string;
    cantidadTutoresActivos?: number;
    tutoresActivos?: TutorActivo[];
    vacantesDisponibles?: number;
    tieneConvenioVigente?: boolean;
    resultadoValidacion?: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
}

interface ValidacionSede {
    id?: number;
    sedeId?: number;
    criterioInfraestructuraCumple?: boolean;
    criterioInfraestructuraObservaciones?: string;
    criterioSeguridadSaludCumple?: boolean;
    criterioSeguridadSaludObservaciones?: string;
    criterioAfinidadCarreraCumple?: boolean;
    criterioAfinidadCarreraObservaciones?: string;
    criterioTutorDesignadoCumple?: boolean;
    criterioTutorDesignadoObservaciones?: string;
    criterioConvenioAcuerdoCumple?: boolean;
    criterioConvenioAcuerdoObservaciones?: string;
    resultadoValidacion?: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
    observacionesGenerales?: string;
    fechaVigenciaDesde?: string;
    fechaVigenciaHasta?: string;
    fechaValidacion?: string;
    nombreValidador?: string;
}

interface SedeFormData {
    empresaId: string;
    nombreSede: string;
    direccion: string;
    distrito: string;
    provincia: string;
    departamento: string;
    telefono: string;
    email: string;
    nombreContacto: string;
    cargoContacto: string;
    telefonoContacto: string;
    emailContacto: string;
    capacidadMaxima: string;
    tipoEntidad: string;
    areaUnidad: string;
    descripcionGeneral: string;
    actividadesPrincipales: string;
    riesgosRelevantes: string;
    nombreTutorEmpresa: string;
    cargoTutorEmpresa: string;
    correoTutorEmpresa: string;
    telefonoTutorEmpresa: string;
    estadoSede: 'ACTIVA' | 'INACTIVA';
}

interface ValidacionFormData {
    sedeId: number | string;
    criterioInfraestructuraCumple: boolean;
    criterioInfraestructuraObservaciones: string;
    criterioSeguridadSaludCumple: boolean;
    criterioSeguridadSaludObservaciones: string;
    criterioAfinidadCarreraCumple: boolean;
    criterioAfinidadCarreraObservaciones: string;
    criterioTutorDesignadoCumple: boolean;
    criterioTutorDesignadoObservaciones: string;
    criterioConvenioAcuerdoCumple: boolean;
    criterioConvenioAcuerdoObservaciones: string;
    resultadoValidacion: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
    observacionesGenerales: string;
    fechaVigenciaDesde: string;
    fechaVigenciaHasta: string;
}

const defaultSedeForm = (): SedeFormData => ({
    empresaId: '', nombreSede: '', direccion: '', distrito: '',
    provincia: '', departamento: '', telefono: '', email: '',
    nombreContacto: '', cargoContacto: '', telefonoContacto: '',
    emailContacto: '', capacidadMaxima: '',
    tipoEntidad: '', areaUnidad: '', descripcionGeneral: '',
    actividadesPrincipales: '', riesgosRelevantes: '',
    nombreTutorEmpresa: '', cargoTutorEmpresa: '', correoTutorEmpresa: '',
    telefonoTutorEmpresa: '', estadoSede: 'ACTIVA'
});

const defaultValidacionForm = (sedeId: number | string = ''): ValidacionFormData => ({
    sedeId,
    criterioInfraestructuraCumple: false, criterioInfraestructuraObservaciones: '',
    criterioSeguridadSaludCumple: false, criterioSeguridadSaludObservaciones: '',
    criterioAfinidadCarreraCumple: false, criterioAfinidadCarreraObservaciones: '',
    criterioTutorDesignadoCumple: false, criterioTutorDesignadoObservaciones: '',
    criterioConvenioAcuerdoCumple: false, criterioConvenioAcuerdoObservaciones: '',
    resultadoValidacion: 'OBSERVADA', observacionesGenerales: '',
    fechaVigenciaDesde: '', fechaVigenciaHasta: ''
});

export const GestionSedes = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth() as { user?: { id?: number } };

    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [detalleId, setDetalleId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filtroEstadoSede, setFiltroEstadoSede] = useState('todos');
    const [filtroValidacion, setFiltroValidacion] = useState('todos');
    const [filtroConvenio, setFiltroConvenio] = useState('todos');
    const [filtroTutor, setFiltroTutor] = useState('todos');
    const [filtroElegible, setFiltroElegible] = useState('todos');

    const [validacionDialogOpen, setValidacionDialogOpen] = useState(false);
    const [validacionSede, setValidacionSede] = useState<SedeCatalogo | SedeDetalle | null>(null);
    const [validacionForm, setValidacionForm] = useState<ValidacionFormData>(defaultValidacionForm());

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('nombreSede');

    const [formData, setFormData] = useState<SedeFormData>(defaultSedeForm());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const asyncTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

    const { data: sedes = [], isLoading: sedesLoading, isFetching: sedesFetching } = useQuery({
        queryKey: ['sedes', 'catalogo'],
        queryFn: async () => {
            const res = await sedeApi.getCatalogo();
            return (res.data?.data || res.data || []) as SedeCatalogo[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: empresas = [] } = useQuery({
        queryKey: ['empresas'],
        queryFn: async () => {
            const res = await empresaApi.getAll();
            const data = (res.data?.data || res.data || []) as Empresa[];
            return data.filter(emp => emp.activo);
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: editSedeData } = useQuery({
        queryKey: ['sedes', 'detalle', editId],
        queryFn: async () => {
            const res = await sedeApi.getDetalle(editId!);
            return (res.data?.data || res.data) as SedeDetalle;
        },
        enabled: !!editId && openDialog && isEditing,
    });

    const { data: selectedSede, isLoading: detalleLoading } = useQuery({
        queryKey: ['sedes', 'detalle', detalleId],
        queryFn: async () => {
            const res = await sedeApi.getDetalle(detalleId!);
            return (res.data?.data || res.data) as SedeDetalle;
        },
        enabled: !!detalleId && drawerOpen,
    });

    const { data: validacionActual, isLoading: vigenteLoading } = useQuery({
        queryKey: ['validaciones-sede', 'vigente', validacionSede?.id],
        queryFn: async () => {
            const res = await validacionApi.getVigente(validacionSede!.id);
            return (res.data?.data || res.data) as ValidacionSede | null;
        },
        enabled: !!validacionSede && validacionDialogOpen,
    });

    const { data: historialValidaciones = [], isLoading: historialLoading } = useQuery({
        queryKey: ['validaciones-sede', 'historial', validacionSede?.id],
        queryFn: async () => {
            const res = await validacionApi.getHistorial(validacionSede!.id);
            return (res.data?.data || res.data || []) as ValidacionSede[];
        },
        enabled: !!validacionSede && validacionDialogOpen,
    });

    const loadingValidacion = vigenteLoading || historialLoading;

    const createSedeMutation = useMutation({
        mutationFn: (data: SedeFormData) => sedeApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sedes'] });
            showSuccess('¡Sede Creada!', 'Los datos se guardaron correctamente.');
            setOpenDialog(false);
        },
        onError: (error: any) => {
            console.error("Error saving sede:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una sede con ese nombre en esta empresa o hubo un error en el servidor.";
            showError('Error al guardar', msg);
        },
    });

    const updateSedeMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: SedeFormData }) => sedeApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sedes'] });
            showSuccess('¡Sede Actualizada!', 'Los datos se guardaron correctamente.');
            setOpenDialog(false);
        },
        onError: (error: any) => {
            console.error("Error saving sede:", error);
            const msg = error.response?.data?.message || error.response?.data?.error || "Ya existe una sede con ese nombre en esta empresa o hubo un error en el servidor.";
            showError('Error al guardar', msg);
        },
    });

    const disableSedeMutation = useMutation({
        mutationFn: (id: number) => sedeApi.disable(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sedes'] });
            showSuccess('¡Deshabilitada!', 'La sede ha sido deshabilitada correctamente.');
        },
        onError: () => showError('Error', 'No se pudo deshabilitar la sede.'),
    });

    const createValidacionMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => validacionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sedes'] });
            queryClient.invalidateQueries({ queryKey: ['validaciones-sede'] });
            showSuccess('¡Validación guardada!');
            setValidacionDialogOpen(false);
        },
        onError: (error: any) => {
            console.error("Error guardando validación:", error);
            showError('Error', error.response?.data?.message || 'No se pudo guardar la validación.');
        },
    });

    const updateValidacionMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => validacionApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sedes'] });
            queryClient.invalidateQueries({ queryKey: ['validaciones-sede'] });
            showSuccess('¡Validación guardada!');
            setValidacionDialogOpen(false);
        },
        onError: (error: any) => {
            console.error("Error guardando validación:", error);
            showError('Error', error.response?.data?.message || 'No se pudo guardar la validación.');
        },
    });

    useEffect(() => {
        const timers = asyncTimers.current;
        return () => {
            Object.values(timers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    useEffect(() => {
        if (isEditing && editSedeData) {
            const s = editSedeData;
            setFormData({
                empresaId: s.empresaId ? String(s.empresaId) : '',
                nombreSede: s.nombreSede || '',
                direccion: s.direccion || '',
                distrito: s.distrito || '',
                provincia: s.provincia || '',
                departamento: s.departamento || '',
                telefono: s.telefono || '',
                email: s.email || '',
                nombreContacto: s.nombreContacto || '',
                cargoContacto: s.cargoContacto || '',
                telefonoContacto: s.telefonoContacto || '',
                emailContacto: s.emailContacto || '',
                capacidadMaxima: s.capacidadMaxima !== undefined ? String(s.capacidadMaxima) : '',
                tipoEntidad: s.tipoEntidad || '',
                areaUnidad: s.areaDisponible || '',
                descripcionGeneral: s.descripcion || '',
                actividadesPrincipales: s.actividadesPrincipales || '',
                riesgosRelevantes: s.riesgosRelevantes || '',
                nombreTutorEmpresa: s.nombreTutorEmpresa || '',
                cargoTutorEmpresa: s.cargoTutorEmpresa || '',
                correoTutorEmpresa: s.correoTutorEmpresa || '',
                telefonoTutorEmpresa: s.telefonoTutorEmpresa || '',
                estadoSede: s.estadoSede || 'ACTIVA'
            });
        }
    }, [isEditing, editSedeData]);

    useEffect(() => {
        if (!validacionSede) return;
        if (validacionActual) {
            setValidacionForm({
                sedeId: validacionSede.id,
                criterioInfraestructuraCumple: validacionActual.criterioInfraestructuraCumple || false,
                criterioInfraestructuraObservaciones: validacionActual.criterioInfraestructuraObservaciones || '',
                criterioSeguridadSaludCumple: validacionActual.criterioSeguridadSaludCumple || false,
                criterioSeguridadSaludObservaciones: validacionActual.criterioSeguridadSaludObservaciones || '',
                criterioAfinidadCarreraCumple: validacionActual.criterioAfinidadCarreraCumple || false,
                criterioAfinidadCarreraObservaciones: validacionActual.criterioAfinidadCarreraObservaciones || '',
                criterioTutorDesignadoCumple: validacionActual.criterioTutorDesignadoCumple || false,
                criterioTutorDesignadoObservaciones: validacionActual.criterioTutorDesignadoObservaciones || '',
                criterioConvenioAcuerdoCumple: validacionActual.criterioConvenioAcuerdoCumple || false,
                criterioConvenioAcuerdoObservaciones: validacionActual.criterioConvenioAcuerdoObservaciones || '',
                resultadoValidacion: validacionActual.resultadoValidacion || 'OBSERVADA',
                observacionesGenerales: validacionActual.observacionesGenerales || '',
                fechaVigenciaDesde: validacionActual.fechaVigenciaDesde || '',
                fechaVigenciaHasta: validacionActual.fechaVigenciaHasta || ''
            });
        } else {
            setValidacionForm(defaultValidacionForm(validacionSede.id));
        }
    }, [validacionSede, validacionActual]);

    const clearNombreTimer = () => {
        if (asyncTimers.current.nombre) {
            clearTimeout(asyncTimers.current.nombre);
            asyncTimers.current.nombre = null;
        }
    };

    const scheduleNombreCheck = (nombre: string) => {
        clearNombreTimer();
        if (!nombre || nombre.length < 2 || !formData.empresaId) return;
        asyncTimers.current.nombre = setTimeout(async () => {
            if (formData.nombreSede !== nombre) return;
            try {
                const res = await sedeApi.checkNombre(nombre, formData.empresaId, isEditing ? editId ?? undefined : undefined);
                const payload = res.data?.data ?? res.data;
                const available = payload?.available;
                setErrors(prev => {
                    const next = { ...prev };
                    if (!available) {
                        next.nombreSede = 'Ya existe una sede con ese nombre en esta empresa';
                    } else if (prev.nombreSede === 'Ya existe una sede con ese nombre en esta empresa') {
                        delete next.nombreSede;
                    }
                    return next;
                });
            } catch {
                // Silently ignore
            }
        }, 600);
    };

    const validateField = (field: string, data: SedeFormData): string | null => {
        switch (field) {
            case 'empresaId':
                return !data.empresaId ? 'Debe seleccionar una empresa' : null;
            case 'nombreSede':
                if (!data.nombreSede?.trim()) return 'El nombre de sede es requerido';
                if (data.nombreSede.length > 200) return 'No debe exceder 200 caracteres';
                return null;
            case 'direccion':
                if (!data.direccion?.trim()) return 'La dirección es requerida';
                return null;
            case 'distrito':
                if (!data.distrito?.trim()) return 'El distrito es requerido';
                return null;
            case 'email':
            case 'emailContacto':
            case 'correoTutorEmpresa':
                if (!data[field]) return null;
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field]) ? 'Formato de correo inválido' : null;
            default:
                return null;
        }
    };

    const handleChange = (field: keyof SedeFormData, value: string) => {
        if (field === 'nombreSede' && asyncTimers.current.nombre) {
            clearNombreTimer();
        }
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        if (touched[field] || errors[field]) {
            const error = validateField(field, newData);
            setErrors(prev => {
                const next = { ...prev };
                if (error) next[field] = error;
                else delete next[field];
                return next;
            });
        }
    };

    const handleBlur = (field: keyof SedeFormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData);
        setErrors(prev => {
            const next = { ...prev };
            if (error) next[field] = error;
            else delete next[field];
            return next;
        });
        if (field === 'nombreSede' && formData.nombreSede?.trim().length >= 2 && !error) {
            scheduleNombreCheck(formData.nombreSede);
        }
    };

    const handleOpenDialog = (sede?: SedeCatalogo) => {
        if (sede) {
            setIsEditing(true);
            setEditId(sede.id);
        } else {
            setIsEditing(false);
            setEditId(null);
            setFormData(defaultSedeForm());
        }
        setErrors({});
        setTouched({});
        setOpenDialog(true);
    };

    const handleCloseDialog = async () => {
        if (formData.nombreSede || formData.direccion || formData.distrito) {
            const result = await Swal.fire({
                title: '¿Descartar cambios?',
                text: 'Si cierras ahora perderás los datos ingresados.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, descartar',
                cancelButtonText: 'Continuar',
                confirmButtonColor: '#dc2626'
            });
            if (!result.isConfirmed) return;
        }
        setOpenDialog(false);
    };

    const validate = (): boolean => {
        const fields: (keyof SedeFormData)[] = ['empresaId', 'nombreSede', 'direccion', 'distrito', 'email', 'emailContacto', 'correoTutorEmpresa'];
        let tempErrors: Record<string, string> = {};
        for (const f of fields) {
            const error = validateField(f, formData);
            if (error) tempErrors[f] = error;
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (isEditing && editId) {
            await updateSedeMutation.mutateAsync({ id: editId, data: formData });
        } else {
            await createSedeMutation.mutateAsync(formData);
        }
    };

    const handleDisable = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Deshabilitar Sede?',
            text: "Esta sede ya no estará disponible para futuros convenios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, deshabilitar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await disableSedeMutation.mutateAsync(id);
        }
    };

    const handleSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (value: number) => { setRowsPerPage(value); setPage(0); };

    const handleVerDetalle = (sede: SedeCatalogo) => {
        setDetalleId(sede.id);
        setDrawerOpen(true);
    };

    const handleVerExpedientes = (sede: SedeCatalogo | SedeDetalle) => {
        showInfo('Expedientes de la Sede', `Funcionalidad para ver expedientes de ${sede.nombreSede} pendiente de implementar.`);
    };

    const handleGestionarTutores = (sede: SedeCatalogo | SedeDetalle) => {
        showInfo('Gestión de Tutores', `Funcionalidad para gestionar tutores de ${sede.nombreSede} pendiente de implementar.`);
    };

    const handleGestionarValidacion = (sede: SedeCatalogo | SedeDetalle) => {
        setValidacionSede(sede);
        setValidacionDialogOpen(true);
    };

    const handleValidacionSave = async () => {
        const payload = {
            ...validacionForm,
            usuarioValidadorId: user?.id || null
        };

        if (validacionActual?.id) {
            await updateValidacionMutation.mutateAsync({ id: validacionActual.id, data: payload });
        } else {
            await createValidacionMutation.mutateAsync(payload);
        }
    };

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value), []);

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstadoSede('todos');
        setFiltroValidacion('todos');
        setFiltroConvenio('todos');
        setFiltroTutor('todos');
        setFiltroElegible('todos');
    };

    const filteredSedes = useMemo(() => {
        let filtered = sedes.filter(sede => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                sede.nombreSede?.toLowerCase().includes(searchLower) ||
                sede.razonSocialEmpresa?.toLowerCase().includes(searchLower) ||
                sede.distrito?.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            if (filtroEstadoSede !== 'todos' && sede.estadoSede !== filtroEstadoSede) return false;

            if (filtroValidacion === 'aprobada' && sede.resultadoValidacion !== 'APROBADA') return false;
            if (filtroValidacion === 'observada' && sede.resultadoValidacion !== 'OBSERVADA') return false;
            if (filtroValidacion === 'rechazada' && sede.resultadoValidacion !== 'RECHAZADA') return false;
            if (filtroValidacion === 'no_validada' && sede.tieneValidacionVigente) return false;

            if (filtroConvenio === 'vigente' && !sede.tieneConvenioVigente) return false;
            if (filtroConvenio === 'no_vigente' && sede.tieneConvenioVigente) return false;

            if (filtroTutor === 'con_tutor' && !sede.tieneTutorActivo) return false;
            if (filtroTutor === 'sin_tutor' && sede.tieneTutorActivo) return false;

            if (filtroElegible === 'elegible' && !sede.esElegible) return false;
            if (filtroElegible === 'no_elegible' && sede.esElegible) return false;

            return true;
        });

        filtered.sort((a, b) => {
            let aVal: any = a[orderBy as keyof SedeCatalogo] || '';
            let bVal: any = b[orderBy as keyof SedeCatalogo] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [sedes, searchTerm, filtroEstadoSede, filtroValidacion, filtroConvenio, filtroTutor, filtroElegible, orderBy, order]);

    const paginatedSedes = filteredSedes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const kpis = useMemo(() => ({
        total: sedes.length,
        activas: sedes.filter(s => s.estadoSede === 'ACTIVA').length,
        validadas: sedes.filter(s => s.resultadoValidacion === 'APROBADA').length,
        conConvenio: sedes.filter(s => s.tieneConvenioVigente).length,
    }), [sedes]);

    const stats = [
        { label: 'Total Sedes', value: kpis.total, icon: <Building size={16} />, accent: 'blue' as const },
        { label: 'Sedes Activas', value: kpis.activas, icon: <CheckCircle2 size={16} />, accent: 'emerald' as const },
        { label: 'Validadas', value: kpis.validadas, icon: <ClipboardCheck size={16} />, accent: 'violet' as const },
        { label: 'Con Convenio', value: kpis.conConvenio, icon: <Building2 size={16} />, accent: 'orange' as const },
    ] as const;

    const getValidacionBadgeVariant = (sede: { tieneValidacionVigente?: boolean; resultadoValidacion?: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA' }): BadgeProps['variant'] => {
        if (!sede.tieneValidacionVigente) return 'neutral';
        switch (sede.resultadoValidacion) {
            case 'APROBADA': return 'success';
            case 'OBSERVADA': return 'warning';
            case 'RECHAZADA': return 'danger';
            default: return 'neutral';
        }
    };

    const getValidacionIcon = (sede: SedeCatalogo) => {
        if (!sede.tieneValidacionVigente) return <XCircle size={12} />;
        switch (sede.resultadoValidacion) {
            case 'APROBADA': return <CheckCircle2 size={12} />;
            case 'OBSERVADA': return <AlertTriangle size={12} />;
            case 'RECHAZADA': return <XCircle size={12} />;
            default: return <XCircle size={12} />;
        }
    };

    const headCells = [
        { id: 'nombreSede', label: 'Sede' },
        { id: 'razonSocialEmpresa', label: 'Empresa' },
        { id: 'distrito', label: 'Ubicación' },
        { id: 'estadoSede', label: 'Estado' },
        { id: 'resultadoValidacion', label: 'Validación' },
        { id: 'tieneConvenioVigente', label: 'Convenio' },
        { id: 'esElegible', label: 'Elegible' },
        { id: 'capacidadMaxima', label: 'Capacidad' },
        { id: 'acciones', label: 'Acciones', sortable: false }
    ];

    const totalPages = Math.ceil(filteredSedes.length / rowsPerPage);
    const from = filteredSedes.length === 0 ? 0 : page * rowsPerPage + 1;
    const to = Math.min((page + 1) * rowsPerPage, filteredSedes.length);

    if (sedesLoading && sedes.length === 0) {
        return (
            <div className="flex justify-center items-center h-[60vh] flex-col gap-6">
                <CircularProgress size={48} thickness={4} sx={{ color: '#1a365d' }} />
                <span className="text-[var(--color-muted-foreground)] font-medium">Cargando catálogo de sedes...</span>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="px-2 sm:px-4 md:px-6 py-4 md:py-8 pb-16 w-full">
                {/* Banner */}
                <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden" style={{ backgroundColor: '#1a365d', color: 'white' }}>
                    <div className="absolute right-[-20px] md:right-5 top-2 md:top-[-20px] opacity-10 pointer-events-none">
                        <Building size={180} className="md:w-[220px] md:h-[220px]" />
                    </div>
                    <div className="relative z-10 w-full">
                        <span className="text-xs font-semibold tracking-widest opacity-80 block mb-1">MÓDULO DE SEDES</span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">Gestión de Sedes</h1>
                        <p className="text-sm md:text-base opacity-90">Administra las sedes operativas vinculadas a las empresas aliadas.</p>
                    </div>
                    <div className="relative z-10 flex gap-3 items-center self-end md:self-center">
                        <Button onClick={() => handleOpenDialog()} style={{ backgroundColor: 'white', color: '#1a365d', fontWeight: 700 }}>
                            <Plus size={18} /> Nueva Sede
                        </Button>
                        <Tooltip content="Actualizar Catálogo">
                            <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['sedes'] })} className="text-white hover:bg-white/20">
                                <RefreshCw size={18} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {stats.map((stat) => {
                        const accentMap = {
                            blue: { bg: '#eff6ff', text: '#1e40af', icon: '#3b82f6' },
                            emerald: { bg: '#ecfdf5', text: '#065f46', icon: '#10b981' },
                            violet: { bg: '#f5f3ff', text: '#5b21b6', icon: '#8b5cf6' },
                            orange: { bg: '#fff7ed', text: '#9a3412', icon: '#f97316' }
                        } as const;
                        const colors = accentMap[stat.accent];
                        return (
                            <div key={stat.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.icon}20` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: colors.icon }}>{stat.icon}</div>
                                <div>
                                    <div className="text-xl md:text-2xl font-extrabold" style={{ color: colors.text }}>{stat.value}</div>
                                    <div className="text-xs md:text-sm font-semibold" style={{ color: colors.text, opacity: 0.8 }}>{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="rounded-2xl border p-4 flex flex-wrap gap-3 mb-6" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border min-w-[260px] flex-1" style={{ borderColor: 'var(--color-border)' }}>
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar sede, empresa o distrito..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-foreground)]"
                        />
                    </div>
                    <Select
                        value={filtroEstadoSede}
                        onChange={(e) => setFiltroEstadoSede(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todos los estados' },
                            { value: 'ACTIVA', label: 'Activa' },
                            { value: 'INACTIVA', label: 'Inactiva' }
                        ]}
                        className="min-w-[140px] w-auto"
                    />
                    <Select
                        value={filtroValidacion}
                        onChange={(e) => setFiltroValidacion(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todas las validaciones' },
                            { value: 'aprobada', label: 'Aprobada' },
                            { value: 'observada', label: 'Observada' },
                            { value: 'rechazada', label: 'Rechazada' },
                            { value: 'no_validada', label: 'No validada' }
                        ]}
                        className="min-w-[160px] w-auto"
                    />
                    <Select
                        value={filtroConvenio}
                        onChange={(e) => setFiltroConvenio(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todos los convenios' },
                            { value: 'vigente', label: 'Vigente' },
                            { value: 'no_vigente', label: 'No vigente' }
                        ]}
                        className="min-w-[150px] w-auto"
                    />
                    <Select
                        value={filtroTutor}
                        onChange={(e) => setFiltroTutor(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todos los tutores' },
                            { value: 'con_tutor', label: 'Con tutor' },
                            { value: 'sin_tutor', label: 'Sin tutor' }
                        ]}
                        className="min-w-[130px] w-auto"
                    />
                    <Select
                        value={filtroElegible}
                        onChange={(e) => setFiltroElegible(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todas' },
                            { value: 'elegible', label: 'Elegible' },
                            { value: 'no_elegible', label: 'No elegible' }
                        ]}
                        className="min-w-[130px] w-auto"
                    />
                    <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
                        <Filter size={14} /> Limpiar Filtros
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-2xl border overflow-hidden relative" style={{ borderColor: 'var(--color-border)' }}>
                    {sedesFetching && (
                        <div className="absolute top-0 left-0 right-0 z-10">
                            <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: '#1a365d' }, bgcolor: '#e2e8f0' }} />
                        </div>
                    )}
                    <div className="overflow-x-auto" style={{ opacity: sedesFetching ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {headCells.map((hc) => (
                                        <TableHead key={hc.id} className="font-bold text-[#475569] py-4">
                                            {hc.sortable !== false
                                                ? (
                                                    <button className="flex items-center gap-1 font-bold text-[#475569] bg-transparent border-none cursor-pointer" onClick={() => handleSort(hc.id)}>
                                                        {hc.label}
                                                        {orderBy === hc.id ? (
                                                            <span>{order === 'asc' ? '↑' : '↓'}</span>
                                                        ) : (
                                                            <span className="opacity-30">↕</span>
                                                        )}
                                                    </button>
                                                )
                                                : hc.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSedes.map((sede) => {
                                    const sc = statusColorMap[sede.estadoSede] ?? statusColorMap.INACTIVA;
                                    return (
                                        <TableRow key={sede.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size="md"
                                                        fallback={getInitials(sede.nombreSede)}
                                                        className={sede.estadoSede === 'ACTIVA' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}
                                                    />
                                                    <div>
                                                        <div className="font-bold text-sm text-[var(--color-foreground)]">{sede.nombreSede}</div>
                                                        <div className="text-xs text-muted-foreground">{sede.direccion || '—'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-sm text-[var(--color-primary)]">{sede.razonSocialEmpresa || '—'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin size={14} />
                                                    {sede.distrito || '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot, boxShadow: `0 0 0 2px ${sc.shadow}` }} />
                                                    <span className="text-xs font-bold" style={{ color: sc.dot }}>{sc.label}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getValidacionBadgeVariant(sede)} size="sm" className="rounded-md gap-1">
                                                    {getValidacionIcon(sede)}
                                                    {sede.resultadoValidacion || 'No validada'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sede.tieneConvenioVigente ? 'success' : 'warning'} size="sm" className="rounded-md">
                                                    {sede.tieneConvenioVigente ? 'Vigente' : 'No vigente'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sede.esElegible ? (
                                                    <Badge variant="success" size="sm" className="rounded-md">Elegible</Badge>
                                                ) : (
                                                    <Tooltip content={sede.motivoNoElegible || 'No cumple requisitos'}>
                                                        <Badge variant="danger" size="sm" className="rounded-md cursor-help">No elegible</Badge>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="neutral" size="sm" className="rounded-md min-w-[40px]">{sede.capacidadMaxima ?? 0}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 justify-center">
                                                    <Tooltip content="Ver Detalle">
                                                        <Button variant="ghost" size="sm" onClick={() => handleVerDetalle(sede)} className="text-[#64748b] hover:text-blue-600 hover:bg-blue-50">
                                                            <Eye size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Editar Sede">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(sede)} className="text-[#64748b] hover:text-blue-600 hover:bg-blue-50">
                                                            <Pencil size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Gestionar Validación">
                                                        <Button variant="ghost" size="sm" onClick={() => handleGestionarValidacion(sede)} className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                                                            <ClipboardCheck size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Gestionar Tutores">
                                                        <Button variant="ghost" size="sm" onClick={() => handleGestionarTutores(sede)} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                                                            <Users size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Ver Expedientes">
                                                        <Button variant="ghost" size="sm" onClick={() => handleVerExpedientes(sede)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                            <GraduationCap size={16} />
                                                        </Button>
                                                    </Tooltip>
                                                    {sede.activo && (
                                                        <Tooltip content="Deshabilitar Sede">
                                                            <Button variant="ghost" size="sm" onClick={() => handleDisable(sede.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredSedes.length === 0 && !sedesFetching && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12">
                                            <Search size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
                                            <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron sedes</h3>
                                            <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o agrega una nueva sede.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredSedes.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="text-sm text-muted-foreground">
                                {from}-{to} de {filteredSedes.length}
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value, 10))}
                                    className="text-sm border rounded-lg px-2 py-1 bg-card"
                                    style={{ borderColor: 'var(--color-border)' }}
                                >
                                    {[5, 10, 25].map(n => (
                                        <option key={n} value={n}>{n} filas</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => handleChangePage(page - 1)}>Anterior</Button>
                                    <span className="text-sm text-muted-foreground px-2">Pág. {page + 1}</span>
                                    <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => handleChangePage(page + 1)}>Siguiente</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog de crear/editar */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}
            >
                <DialogTitle sx={{ bgcolor: '#1a365d', color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Building />
                    <span className="text-lg font-bold">{isEditing ? 'Editar Sede' : 'Registrar Nueva Sede'}</span>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    <div className="flex flex-col gap-4 pt-2">
                        <TextField
                            select fullWidth label="Empresa Aliada *"
                            value={formData.empresaId}
                            onChange={e => handleChange('empresaId', e.target.value)}
                            onBlur={() => handleBlur('empresaId')}
                            disabled={isEditing}
                            error={!!errors.empresaId}
                            helperText={errors.empresaId || ' '}
                        >
                            {empresas.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.razonSocial} (RUC: {emp.ruc})</MenuItem>
                            ))}
                        </TextField>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField
                                sx={{ flex: 2 }} label="Nombre de la Sede *" value={formData.nombreSede}
                                onChange={e => handleChange('nombreSede', e.target.value)}
                                onBlur={() => handleBlur('nombreSede')}
                                error={!!errors.nombreSede} helperText={errors.nombreSede || 'Nombre único dentro de la empresa'}
                                slotProps={{ htmlInput: { maxLength: 200 } }}
                            />
                            <TextField
                                sx={{ flex: 1 }} label="Capacidad Máxima" type="number"
                                value={formData.capacidadMaxima}
                                onChange={e => handleChange('capacidadMaxima', e.target.value)}
                                helperText="Estudiantes"
                            />
                        </div>

                        <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-1 mt-1" style={{ borderColor: '#1a365d20' }}>Ubicación</h4>

                        <TextField fullWidth label="Dirección *" value={formData.direccion}
                            onChange={e => handleChange('direccion', e.target.value)}
                            onBlur={() => handleBlur('direccion')}
                            error={!!errors.direccion} helperText={errors.direccion || ' '}
                            slotProps={{ htmlInput: { maxLength: 300 } }}
                        />

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 1 }} label="Distrito *" value={formData.distrito}
                                onChange={e => handleChange('distrito', e.target.value)}
                                onBlur={() => handleBlur('distrito')}
                                error={!!errors.distrito} helperText={errors.distrito || ' '}
                            />
                            <TextField sx={{ flex: 1 }} label="Provincia" value={formData.provincia}
                                onChange={e => handleChange('provincia', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Departamento" value={formData.departamento}
                                onChange={e => handleChange('departamento', e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 1 }} label="Teléfono" value={formData.telefono}
                                onChange={e => handleChange('telefono', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Email" type="email" value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                error={!!errors.email} helperText={errors.email || ' '}
                            />
                        </div>

                        <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-1" style={{ borderColor: '#1a365d20' }}>Contacto en Sede</h4>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 1 }} label="Nombre del Contacto" value={formData.nombreContacto}
                                onChange={e => handleChange('nombreContacto', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Cargo del Contacto" value={formData.cargoContacto}
                                onChange={e => handleChange('cargoContacto', e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 1 }} label="Teléfono de Contacto" value={formData.telefonoContacto}
                                onChange={e => handleChange('telefonoContacto', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Email de Contacto" type="email" value={formData.emailContacto}
                                onChange={e => handleChange('emailContacto', e.target.value)}
                                onBlur={() => handleBlur('emailContacto')}
                                error={!!errors.emailContacto} helperText={errors.emailContacto || ' '}
                            />
                        </div>

                        <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-1" style={{ borderColor: '#1a365d20' }}>Perfil de Sede</h4>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField
                                select fullWidth label="Tipo de Entidad"
                                value={formData.tipoEntidad}
                                onChange={e => handleChange('tipoEntidad', e.target.value)}
                            >
                                <MenuItem value="">Seleccione...</MenuItem>
                                <MenuItem value="PÚBLICA">Pública</MenuItem>
                                <MenuItem value="PRIVADA">Privada</MenuItem>
                                <MenuItem value="MIXTA">Mixta</MenuItem>
                            </TextField>
                            <TextField sx={{ flex: 1 }} label="Área / Unidad" value={formData.areaUnidad}
                                onChange={e => handleChange('areaUnidad', e.target.value)}
                                placeholder="Ej: Producción, Logística"
                            />
                        </div>

                        <TextField fullWidth label="Descripción General" multiline rows={3}
                            value={formData.descripcionGeneral}
                            onChange={e => handleChange('descripcionGeneral', e.target.value)}
                            placeholder="Describir las actividades y funciones de la sede"
                        />
                        <TextField fullWidth label="Actividades Principales" multiline rows={2}
                            value={formData.actividadesPrincipales}
                            onChange={e => handleChange('actividadesPrincipales', e.target.value)}
                        />
                        <TextField fullWidth label="Riesgos Relevantes" multiline rows={2}
                            value={formData.riesgosRelevantes}
                            onChange={e => handleChange('riesgosRelevantes', e.target.value)}
                        />

                        <h4 className="text-sm font-bold text-[#1a365d] border-b-2 pb-1" style={{ borderColor: '#1a365d20' }}>Tutor de Empresa (designado por la entidad)</h4>

                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 2 }} label="Nombre del Tutor" value={formData.nombreTutorEmpresa}
                                onChange={e => handleChange('nombreTutorEmpresa', e.target.value)}
                            />
                            <TextField sx={{ flex: 1 }} label="Cargo del Tutor" value={formData.cargoTutorEmpresa}
                                onChange={e => handleChange('cargoTutorEmpresa', e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 flex-col md:flex-row">
                            <TextField sx={{ flex: 2 }} label="Correo del Tutor" type="email" value={formData.correoTutorEmpresa}
                                onChange={e => handleChange('correoTutorEmpresa', e.target.value)}
                                onBlur={() => handleBlur('correoTutorEmpresa')}
                                error={!!errors.correoTutorEmpresa} helperText={errors.correoTutorEmpresa || ' '}
                            />
                            <TextField sx={{ flex: 1 }} label="Teléfono del Tutor" value={formData.telefonoTutorEmpresa}
                                onChange={e => handleChange('telefonoTutorEmpresa', e.target.value)}
                            />
                        </div>

                        <TextField select fullWidth label="Estado de la Sede"
                            value={formData.estadoSede}
                            onChange={e => handleChange('estadoSede', e.target.value)}
                        >
                            <MenuItem value="ACTIVA">Activa</MenuItem>
                            <MenuItem value="INACTIVA">Inactiva</MenuItem>
                        </TextField>
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button variant="secondary" onClick={() => setOpenDialog(false)} disabled={createSedeMutation.isPending || updateSedeMutation.isPending}>Cancelar</Button>
                    <Button onClick={handleSave} loading={createSedeMutation.isPending || updateSedeMutation.isPending}>
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Drawer de detalle */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 2,
                    '& .MuiDrawer-paper': { width: 700 }
                }}
            >
                <div className="bg-[#1a365d] text-white p-5 flex items-center gap-3">
                    <Building />
                    <span className="text-lg font-bold">Detalle de Sede</span>
                </div>
                {detalleLoading ? (
                    <div className="flex justify-center py-8">
                        <CircularProgress />
                    </div>
                ) : selectedSede && (
                    <div className="p-4 md:p-6 overflow-auto">
                        <h2 className="text-xl font-bold text-[var(--color-primary)] mb-1">{selectedSede.nombreSede}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{selectedSede.razonSocialEmpresa}</p>

                        <Divider sx={{ my: 2 }} />

                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">Estado de Habilitación</h4>
                        <div className="flex gap-2 flex-wrap mb-3">
                            <Badge variant={selectedSede.esElegible ? 'success' : 'warning'}>{selectedSede.esElegible ? 'ELEGIBLE' : 'NO ELEGIBLE'}</Badge>
                            <Badge variant={selectedSede.estadoSede === 'ACTIVA' ? 'success' : 'danger'}>{selectedSede.estadoSede || 'ACTIVA'}</Badge>
                            {!selectedSede.esElegible && selectedSede.motivoNoElegible && (
                                <span className="text-xs text-muted-foreground w-full mt-1">{selectedSede.motivoNoElegible}</span>
                            )}
                        </div>

                        <Divider sx={{ my: 2 }} />
                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">Datos de la Sede</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><span className="text-xs text-muted-foreground block">Dirección</span><span className="text-sm">{selectedSede.direccion || '—'}</span></div>
                            <div><span className="text-xs text-muted-foreground block">Ubicación</span><span className="text-sm">{selectedSede.departamento ? `${selectedSede.departamento}, ${selectedSede.provincia}, ${selectedSede.distrito}` : (selectedSede.distrito || '—')}</span></div>
                            <div><span className="text-xs text-muted-foreground block">Tipo de entidad</span><span className="text-sm">{selectedSede.tipoEntidad || '—'}</span></div>
                            <div><span className="text-xs text-muted-foreground block">Área disponible</span><span className="text-sm">{selectedSede.areaDisponible || 'No especificada'}</span></div>
                            <div><span className="text-xs text-muted-foreground block">Capacidad máxima</span><span className="text-sm">{selectedSede.capacidadMaxima ?? 'No especificada'}</span></div>
                            <div><span className="text-xs text-muted-foreground block">Vacantes disponibles</span><span className="text-sm">{selectedSede.vacantesDisponibles ?? 0}</span></div>
                        </div>
                        {selectedSede.descripcion && (
                            <div className="mt-4"><span className="text-xs text-muted-foreground block">Descripción</span><span className="text-sm">{selectedSede.descripcion}</span></div>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">Información de Habilitación</h4>
                        <div className="flex gap-2 flex-wrap mb-2">
                            <Badge variant={selectedSede.tieneConvenioVigente ? 'success' : 'danger'}>{selectedSede.tieneConvenioVigente ? 'Convenio Vigente' : 'Sin Convenio'}</Badge>
                            <Badge variant={getValidacionBadgeVariant(selectedSede)}>{`Validación: ${selectedSede.resultadoValidacion || 'No validada'}`}</Badge>
                        </div>
                        {selectedSede.fechaVigenciaConvenio && (
                            <span className="text-xs text-muted-foreground block">Convenio vence: {new Date(selectedSede.fechaVigenciaConvenio).toLocaleDateString()}</span>
                        )}
                        {selectedSede.fechaVigenciaValidacion && (
                            <span className="text-xs text-muted-foreground block">Validación vigente hasta: {new Date(selectedSede.fechaVigenciaValidacion).toLocaleDateString()}</span>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">Tutores Activos ({selectedSede.cantidadTutoresActivos || 0})</h4>
                        {selectedSede.tutoresActivos && selectedSede.tutoresActivos.length > 0 ? (
                            <div className="flex flex-col gap-2 mb-4">
                                {selectedSede.tutoresActivos.map((tutor) => (
                                    <div key={tutor.id} className="p-3 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--color-border)' }}>
                                        <div className="font-bold text-sm">{tutor.nombres} {tutor.apellidoPaterno} {tutor.apellidoMaterno}</div>
                                        <div className="text-xs text-muted-foreground">Cargo: {tutor.cargo}</div>
                                        <div className="text-xs text-muted-foreground">Correo: {tutor.correo}</div>
                                        <div className="text-xs text-muted-foreground">Teléfono: {tutor.telefono || 'No especificado'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mb-4">No hay tutores activos asignados</p>
                        )}

                        <div className="mt-4 flex gap-3 flex-col sm:flex-row">
                            <Button variant="secondary" onClick={() => { setDrawerOpen(false); handleGestionarValidacion(selectedSede); }} className="flex-1">Gestionar Validación</Button>
                            <Button variant="secondary" onClick={() => { setDrawerOpen(false); handleGestionarTutores(selectedSede); }} className="flex-1">Gestionar Tutores</Button>
                        </div>
                        <div className="mt-3 flex gap-3 flex-col sm:flex-row">
                            <Button variant="secondary" onClick={() => { setDrawerOpen(false); handleVerExpedientes(selectedSede); }} className="flex-1">Ver Expedientes</Button>
                            <Button onClick={() => setDrawerOpen(false)} className="flex-1">Cerrar</Button>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Validación Dialog */}
            <Dialog
                open={validacionDialogOpen}
                onClose={() => setValidacionDialogOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } } }}
            >
                <DialogTitle sx={{
                    bgcolor: validacionActual?.resultadoValidacion === 'APROBADA' ? '#065f46' : validacionActual?.resultadoValidacion === 'RECHAZADA' ? '#991b1b' : '#92400e',
                    color: '#fff', py: 2.5, px: 4, display: 'flex', alignItems: 'center', gap: 1.5
                }}>
                    <ClipboardCheck />
                    <span className="text-lg font-bold">Validación de Sede: {validacionSede?.nombreSede}</span>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
                    {loadingValidacion ? (
                        <div className="flex justify-center py-8"><CircularProgress /></div>
                    ) : (
                        <div className="flex flex-col gap-4 pt-2">
                            {validacionActual && (
                                <Alert severity={(validacionActual.resultadoValidacion === 'APROBADA' ? 'success' : validacionActual.resultadoValidacion === 'RECHAZADA' ? 'error' : 'warning') as AlertColor} sx={{ borderRadius: 2 }}>
                                    Validación vigente: <strong>{validacionActual.resultadoValidacion}</strong>
                                    {validacionActual.fechaVigenciaHasta && ` — Vigente hasta: ${new Date(validacionActual.fechaVigenciaHasta).toLocaleDateString()}`}
                                </Alert>
                            )}

                            {historialValidaciones.length > 0 && (
                                <div>
                                    <span className="text-sm font-semibold text-muted-foreground block mb-2">Historial de validaciones:</span>
                                    <div className="flex flex-col gap-2">
                                        {historialValidaciones.map(v => (
                                            <div key={v.id} className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--color-border)' }}>
                                                <Badge variant={v.resultadoValidacion === 'APROBADA' ? 'success' : v.resultadoValidacion === 'RECHAZADA' ? 'danger' : 'warning'}>{v.resultadoValidacion}</Badge>
                                                <span className="text-xs text-muted-foreground">{v.nombreValidador} — {v.fechaValidacion ? new Date(v.fechaValidacion).toLocaleDateString() : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h4 className="text-lg font-bold text-[#1a365d] border-b-2 pb-1" style={{ borderColor: '#1a365d' }}>Criterios de Validación</h4>

                            {[
                                { key: 'criterioInfraestructuraCumple', obsKey: 'criterioInfraestructuraObservaciones', label: 'Infraestructura adecuada', desc: 'La sede cuenta con espacios físicos adecuados para el desarrollo de prácticas.' },
                                { key: 'criterioSeguridadSaludCumple', obsKey: 'criterioSeguridadSaludObservaciones', label: 'Seguridad y salud ocupacional', desc: 'Cumple con condiciones de seguridad y salud en el trabajo.' },
                                { key: 'criterioAfinidadCarreraCumple', obsKey: 'criterioAfinidadCarreraObservaciones', label: 'Afinidad con la carrera', desc: 'Las actividades se relacionan con el perfil profesional de Ingeniería Industrial.' },
                                { key: 'criterioTutorDesignadoCumple', obsKey: 'criterioTutorDesignadoObservaciones', label: 'Tutor designado', desc: 'La sede ha designado un tutor externo para acompañar al estudiante.' },
                                { key: 'criterioConvenioAcuerdoCumple', obsKey: 'criterioConvenioAcuerdoObservaciones', label: 'Convenio o acuerdo vigente', desc: 'Existe un convenio o acuerdo formal vigente con la universidad.' }
                            ].map(criterio => (
                                <div key={criterio.key} className="p-4 rounded-2xl border" style={{ borderColor: 'var(--color-border)' }}>
                                    <FormControlLabel
                                        className="items-start mb-2 mr-0"
                                        control={
                                            <Checkbox
                                                checked={validacionForm[criterio.key as keyof ValidacionFormData] as boolean}
                                                onChange={e => setValidacionForm(prev => ({ ...prev, [criterio.key]: e.target.checked } as ValidacionFormData))}
                                            />
                                        }
                                        label={
                                            <div>
                                                <div className="font-bold text-sm">{criterio.label}</div>
                                                <div className="text-xs text-muted-foreground">{criterio.desc}</div>
                                            </div>
                                        }
                                    />
                                    <TextField
                                        fullWidth size="small" placeholder="Observaciones (opcional)"
                                        value={validacionForm[criterio.obsKey as keyof ValidacionFormData] as string}
                                        onChange={e => setValidacionForm(prev => ({ ...prev, [criterio.obsKey]: e.target.value } as ValidacionFormData))}
                                        className="ml-8"
                                    />
                                </div>
                            ))}

                            <h4 className="text-lg font-bold text-[#1a365d] border-b-2 pb-1" style={{ borderColor: '#1a365d' }}>Resultado</h4>

                            <TextField select fullWidth label="Resultado de Validación"
                                value={validacionForm.resultadoValidacion}
                                onChange={e => setValidacionForm({ ...validacionForm, resultadoValidacion: e.target.value as ValidacionFormData['resultadoValidacion'] })}
                            >
                                <MenuItem value="APROBADA">Aprobada</MenuItem>
                                <MenuItem value="OBSERVADA">Observada</MenuItem>
                                <MenuItem value="RECHAZADA">Rechazada</MenuItem>
                            </TextField>

                            <TextField fullWidth multiline rows={2} label="Observaciones Generales"
                                value={validacionForm.observacionesGenerales}
                                onChange={e => setValidacionForm({ ...validacionForm, observacionesGenerales: e.target.value })}
                            />

                            <div className="flex gap-4 flex-col md:flex-row">
                                <TextField
                                    fullWidth type="date" label="Vigencia desde"
                                    value={validacionForm.fechaVigenciaDesde}
                                    onChange={e => setValidacionForm({ ...validacionForm, fechaVigenciaDesde: e.target.value })}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                                <TextField
                                    fullWidth type="date" label="Vigencia hasta"
                                    value={validacionForm.fechaVigenciaHasta}
                                    onChange={e => setValidacionForm({ ...validacionForm, fechaVigenciaHasta: e.target.value })}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button variant="secondary" onClick={() => setValidacionDialogOpen(false)} disabled={createValidacionMutation.isPending || updateValidacionMutation.isPending}>Cancelar</Button>
                    <Button onClick={handleValidacionSave} loading={createValidacionMutation.isPending || updateValidacionMutation.isPending}>
                        {validacionActual?.id ? 'Actualizar Validación' : 'Guardar Validación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};
