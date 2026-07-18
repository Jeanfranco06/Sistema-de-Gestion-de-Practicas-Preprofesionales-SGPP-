import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Avatar,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Person,
  School,
  Edit,
  Save,
  CheckCircle,
  Warning,
  ArrowBack,
  Grade
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { usuariosApi } from '../../../api/usuariosApi';
import api from '../../../api/axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const PerfilEstudiante = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    semestreActual: '',
    creditosAprobados: '',
    promedioPonderado: '',
    fechaIngreso: '',
    estadoAcademico: ''
  });

  const requisitosInfo = {
    inicial: { creditos: 100, semestre: 6 },
    final: { creditos: 180, semestre: 9 },
    profesional: { creditos: 180, semestre: 9 }
  };

  useEffect(() => {
    cargarPerfilEstudiante();
  }, []);

  const cargarPerfilEstudiante = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estudiante/perfil-academico');
      const estudianteData = response.data.data;
      
      if (estudianteData) {
        setFormData({
          semestreActual: estudianteData.semestreActual || 6,
          creditosAprobados: estudianteData.creditosAprobados || 0,
          promedioPonderado: estudianteData.promedioPonderado || 0,
          fechaIngreso: estudianteData.fechaIngreso || '',
          estadoAcademico: estudianteData.estadoAcademico || 'ACTIVO'
        });
      } else {
        setFormData({
          semestreActual: user?.semestreActual || 6,
          creditosAprobados: user?.creditosAprobados || 0,
          promedioPonderado: user?.promedioPonderado || 0,
          fechaIngreso: user?.fechaIngreso || '',
          estadoAcademico: user?.estadoAcademico || 'ACTIVO'
        });
      }
    } catch (err) {
      setError('Error al cargar el perfil del estudiante');
      console.error(err);
      setFormData({
        semestreActual: user?.semestreActual || 6,
        creditosAprobados: user?.creditosAprobados || 0,
        promedioPonderado: user?.promedioPonderado || 0,
        fechaIngreso: user?.fechaIngreso || '',
        estadoAcademico: user?.estadoAcademico || 'ACTIVO'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const promedio = parseFloat(formData.promedioPonderado);
    if (Number.isNaN(promedio) || promedio < 0 || promedio > 20) {
      setError('El promedio ponderado debe estar entre 0 y 20.');
      setSaving(false);
      return;
    }
    if (formData.semestreActual < 1 || formData.semestreActual > 20) {
      setError('El semestre actual debe estar entre 1 y 20.');
      setSaving(false);
      return;
    }

    try {
      await usuariosApi.actualizarPerfilAcademico(formData);
      
      await MySwal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Tu información académica ha sido actualizada exitosamente.',
        timer: 3000,
        showConfirmButton: false
      });
      
      setSuccess('Información académica actualizada correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'REGULAR': return 'warning';
      case 'MATRICULADO': return 'info';
      case 'SUSPENDIDO': return 'warning';
      case 'EGRESADO': return 'default';
      case 'GRADUADO': return 'default';
      default: return 'default';
    }
  };

  const cumpleRequisito = (tipo) => {
    const req = requisitosInfo[tipo];
    const estadosValidos = ['ACTIVO', 'REGULAR', 'MATRICULADO'];
    const promedio = parseFloat(formData.promedioPonderado) || 0;
    return formData.creditosAprobados >= req.credits && 
           formData.semestreActual >= req.semestre &&
           estadosValidos.includes(formData.estadoAcademico) &&
           promedio > 0 && promedio <= 20;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      px: { xs: 2, md: 4, lg: 6 }, 
      py: { xs: 3, md: 5 }, 
      width: '100%',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/estudiante/dashboard')}
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            py: 1,
            bgcolor: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
          }}
        >
          Volver al Dashboard
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0f172a">
            Perfil Académico
          </Typography>
          <Typography variant="body2" color="#64748b" mt={0.5}>
            Mantén actualizada tu información para acceder a las prácticas
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Columna Izquierda - Información Personal */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header Gradiente */}
            <Box sx={{
              height: 100,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: '12px 12px 0 0'
            }} />
            
            <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -5, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#ffffff',
                    color: '#2563eb',
                    fontSize: 40, 
                    mb: 2,
                    border: '3px solid white',
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)'
                  }}
                >
                  {user?.nombres?.charAt(0) || 'E'}
                </Avatar>
                <Typography variant="h5" fontWeight={700} color="#0f172a" gutterBottom>
                  {user?.nombres} {user?.apellidoPaterno}
                </Typography>
                <Typography variant="body2" color="#64748b" gutterBottom>
                  {user?.codigoEstudiantil}
                </Typography>
                <Chip 
                  label={formData.estadoAcademico} 
                  color={getEstadoColor(formData.estadoAcademico)}
                  size="medium"
                  sx={{ 
                    mt: 1.5,
                    fontWeight: 600,
                    px: 2
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Datos Académicos Resumidos */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ 
                    bgcolor: '#eff6ff', 
                    p: 1.2, 
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <School sx={{ color: '#2563eb', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#64748b" fontWeight={500}>Semestre Actual</Typography>
                    <Typography variant="h6" fontWeight={700} color="#0f172a">{formData.semestreActual}°</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ 
                    bgcolor: '#ecfdf5', 
                    p: 1.2, 
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Person sx={{ color: '#059669', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#64748b" fontWeight={500}>Créditos Aprobados</Typography>
                    <Typography variant="h6" fontWeight={700} color="#0f172a">{formData.creditosAprobados}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ 
                    bgcolor: '#fffbeb', 
                    p: 1.2, 
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Grade sx={{ color: '#d97706', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#64748b" fontWeight={500}>Promedio Ponderado</Typography>
                    <Typography variant="h6" fontWeight={700} color="#0f172a">{formData.promedioPonderado || '-'}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna Derecha - Formulario */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 3,
            height: '100%',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  bgcolor: '#eff6ff', 
                  p: 1.2, 
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit sx={{ color: '#2563eb', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#0f172a">
                    Actualizar Información Académica
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Modifica tus datos y guarda los cambios
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Semestre Actual"
                      name="semestreActual"
                      type="number"
                      value={formData.semestreActual}
                      onChange={handleChange}
                      required
                      helperText="Semestre en el que te encuentras (1-12)"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Créditos Aprobados"
                      name="creditosAprobados"
                      type="number"
                      value={formData.creditosAprobados}
                      onChange={handleChange}
                      required
                      helperText="Total de créditos aprobados hasta la fecha"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Promedio Ponderado"
                      name="promedioPonderado"
                      type="number"
                      step="0.01"
                      value={formData.promedioPonderado}
                      onChange={handleChange}
                      helperText="Promedio ponderado acumulado (0-20)"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Ingreso"
                      name="fechaIngreso"
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={handleChange}
                      helperText="Fecha de ingreso a la carrera"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Estado Académico</InputLabel>
                      <Select
                        name="estadoAcademico"
                        value={formData.estadoAcademico}
                        onChange={handleChange}
                        label="Estado Académico"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                        <MenuItem value="REGULAR">REGULAR</MenuItem>
                        <MenuItem value="MATRICULADO">MATRICULADO</MenuItem>
                        <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
                        <MenuItem value="EGRESADO">EGRESADO</MenuItem>
                        <MenuItem value="GRADUADO">GRADUADO</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => cargarPerfilEstudiante()}
                    disabled={saving}
                    sx={{ 
                      borderRadius: 2, 
                      px: 3, 
                      borderColor: '#cbd5e1',
                      color: '#64748b'
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={saving}
                    sx={{ 
                      borderRadius: 2, 
                      px: 4,
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        boxShadow: '0 6px 12px rgba(37, 99, 235, 0.4)'
                      }
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Requisitos */}
      <Box mt={4}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ 
                bgcolor: '#ecfdf5', 
                p: 1.2, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle sx={{ color: '#059669', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#0f172a">
                  Verificación de Requisitos
                </Typography>
                <Typography variant="body2" color="#64748b">
                  Revisa si cumples con los requisitos para cada tipo de práctica
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {[
                { key: 'inicial', nombre: 'Práctica Inicial', creditosStr: '100 créditos', semestreStr: '6to semestre' },
                { key: 'final', nombre: 'Práctica Final', creditosStr: '180 créditos', semestreStr: '9no semestre' },
                { key: 'profesional', nombre: 'Práctica Profesional', creditosStr: '180 créditos', semestreStr: '9no semestre' }
              ].map((tipo) => {
                const cumple = cumpleRequisito(tipo.key);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={tipo.key}>
                    <Card 
                      sx={{ 
                        borderRadius: 2, 
                        border: `2px solid ${cumple ? '#10b981' : '#ef4444'}`,
                        bgcolor: cumple ? '#ecfdf5' : '#fef2f2',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <Box sx={{ 
                            bgcolor: cumple ? '#10b981' : '#ef4444',
                            p: 0.8,
                            borderRadius: 1.2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {cumple ? <CheckCircle sx={{ color: 'white', fontSize: 18 }} /> : <Warning sx={{ color: 'white', fontSize: 18 }} />}
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                            {tipo.nombre}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ 
                              width: 7, 
                              height: 7, 
                              borderRadius: '50%', 
                              bgcolor: cumple ? '#10b981' : '#ef4444' 
                            }} />
                            <Typography variant="body2" color="#475569" fontWeight={500}>
                              {tipo.creditosStr}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ 
                              width: 7, 
                              height: 7, 
                              borderRadius: '50%', 
                              bgcolor: cumple ? '#10b981' : '#ef4444' 
                            }} />
                            <Typography variant="body2" color="#475569" fontWeight={500}>
                              {tipo.semestreStr}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ 
                              width: 7, 
                              height: 7, 
                              borderRadius: '50%', 
                              bgcolor: cumple ? '#10b981' : '#ef4444' 
                            }} />
                            <Typography variant="body2" color="#475569" fontWeight={500}>
                              Estado ACTIVO
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Chip 
                          label={cumple ? '✓ CUMPLE' : '✗ NO CUMPLE'}
                          color={cumple ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            width: '100%', 
                            fontWeight: 700,
                            py: 1
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Alert 
              severity="info" 
              sx={{ 
                mt: 3, 
                borderRadius: 2,
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe'
              }}
              icon={<School sx={{ color: '#2563eb' }} />}
            >
              <Typography variant="body2" color="#1e40af">
                <strong>Nota:</strong> Para solicitar una práctica, debes cumplir con los requisitos mínimos. Actualiza tu información para reflejar tu progreso.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PerfilEstudiante;
