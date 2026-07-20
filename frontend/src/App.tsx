import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { Suspense } from 'react';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import { ThemeProvider as AppThemeProvider } from './shared/theme/ThemeContext';
import ThemeProviderWrapper from './shared/theme/ThemeProviderWrapper';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './modules/shared/layout/AppLayout';
import LoginPage from './modules/auth/LoginPage';
import ForgotPasswordPage from './modules/auth/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/ResetPasswordPage';
import NoAutorizado from './modules/shared/NoAutorizado';
import PaginaEnConstruccion from './modules/shared/PaginaEnConstruccion';

const DashboardEstudiante = React.lazy(() => import('./modules/estudiante/DashboardEstudiante'));
const DashboardDocente = React.lazy(() => import('./modules/docente/pages/DashboardDocente'));
const CatalogoSedes = React.lazy(() => import('./modules/sedes/pages/CatalogoSedes'));
const SolicitarPractica = React.lazy(() => import('./modules/estudiante/pages/SolicitarPractica'));
const GestionSedes = React.lazy(() => import('./modules/sedes/pages/GestionSedes'));
const GestionEmpresas = React.lazy(() => import('./modules/sedes/pages/GestionEmpresas'));
const GestionConvenios = React.lazy(() => import('./modules/sedes/pages/GestionConvenios'));
const ValidarRequisitos = React.lazy(() => import('./modules/secretaria/pages/ValidarRequisitos'));
const GestionDocumental = React.lazy(() => import('./modules/estudiante/pages/GestionDocumental'));
const InformesPeriodicos = React.lazy(() => import('./modules/estudiante/pages/InformesPeriodicos'));
const RegistroHoras = React.lazy(() => import('./modules/estudiante/pages/RegistroHoras'));
const PerfilEstudiante = React.lazy(() => import('./modules/estudiante/pages/PerfilEstudiante'));
const MiPractica = React.lazy(() => import('./modules/estudiante/pages/MiPractica'));
const PlanPracticas = React.lazy(() => import('./modules/estudiante/pages/PlanPracticas'));
const RevisionDocumental = React.lazy(() => import('./modules/shared/pages/RevisionDocumental'));
const ListaPracticantes = React.lazy(() => import('./modules/evaluacion/ListaPracticantes'));
const AdminDashboardPage = React.lazy(() => import('./modules/admin/pages/AdminDashboardPage'));
const DashboardTutor = React.lazy(() => import('./modules/tutor/pages/DashboardTutor'));
const ValidacionHorasTutor = React.lazy(() => import('./modules/tutor/pages/ValidacionHorasTutor'));
const EvaluacionTutorExterno = React.lazy(() => import('./modules/evaluacion/EvaluacionTutorExterno'));
const EvaluacionDocenteAsesor = React.lazy(() => import('./modules/evaluacion/EvaluacionDocenteAsesor'));
const EvaluacionComite = React.lazy(() => import('./modules/evaluacion/EvaluacionComite'));
const PanelComite = React.lazy(() => import('./modules/comite/pages/PanelComite'));
const RecepcionAdministrativa = React.lazy(() => import('./modules/secretaria/pages/RecepcionAdministrativa'));
const DashboardCoordinacion = React.lazy(() => import('./modules/coordinacion/pages/DashboardCoordinacion'));
const ReportesCoordinacion = React.lazy(() => import('./modules/coordinacion/pages/Reportes'));
const DetalleExpediente = React.lazy(() => import('./modules/coordinacion/pages/DetalleExpediente'));
const AdminReportesPage = React.lazy(() => import('./modules/admin/pages/AdminReportesPage'));
const GestionExpedientes = React.lazy(() => import('./modules/admin/pages/GestionExpedientes'));
const GestionUsuarios = React.lazy(() => import('./modules/admin/pages/GestionUsuarios'));
const GestionTutores = React.lazy(() => import('./modules/admin/pages/GestionTutores'));
const ConfiguracionSistema = React.lazy(() => import('./modules/admin/pages/ConfiguracionSistema'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ThemeProviderWrapper>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[var(--color-background)]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-600)] border-t-transparent" /></div>}>
                <Routes>
                  {/* Pública */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/no-autorizado" element={<NoAutorizado />} />

                  {/* Rutas protegidas con layout */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                >
                  {/* Estudiante */}
                  <Route
                    path="/estudiante/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                        <DashboardEstudiante />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/estudiante/practica" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <MiPractica />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/solicitar-practica" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <SolicitarPractica />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/documentos" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <GestionDocumental />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/plan-practicas" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <PlanPracticas />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/informes" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <InformesPeriodicos />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/perfil" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <PerfilEstudiante />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/horas" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <RegistroHoras />
                    </ProtectedRoute>
                  } />
                  <Route path="/estudiante/evaluacion" element={<PaginaEnConstruccion titulo="Evaluación" />} />
                  <Route
                    path="/estudiante/sedes"
                    element={
                      <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                        <CatalogoSedes />
                      </ProtectedRoute>
                    }
                  />

                  {/* Docente */}
                  <Route
                    path="/docente/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['DOCENTE_ASESOR']}>
                        <DashboardDocente />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/docente/practicantes" element={
                    <ProtectedRoute allowedRoles={['DOCENTE_ASESOR']}>
                      <ListaPracticantes />
                    </ProtectedRoute>
                  } />
                  <Route path="/docente/evaluaciones/:id" element={
                    <ProtectedRoute allowedRoles={['DOCENTE_ASESOR']}>
                      <EvaluacionDocenteAsesor />
                    </ProtectedRoute>
                  } />

                  {/* Admin / otros roles */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/usuarios"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionUsuarios />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/tutores"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionTutores />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/validar-requisitos"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA']}>
                        <ValidarRequisitos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/configuracion"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR']}>
                        <ConfiguracionSistema />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/docente/documentos/:id" element={
                    <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'COMITE_PRACTICAS', 'DOCENTE_ASESOR']}>
                      <RevisionDocumental />
                    </ProtectedRoute>
                  } />

                  {/* Coordinador / Director */}
                  <Route path="/coordinacion/dashboard" element={
                    <ProtectedRoute allowedRoles={['COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS']}>
                      <DashboardCoordinacion />
                    </ProtectedRoute>
                  } />
                  <Route path="/coordinacion/reportes" element={
                    <ProtectedRoute allowedRoles={['COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA', 'SECRETARIA', 'COMITE_PRACTICAS']}>
                      <ReportesCoordinacion />
                    </ProtectedRoute>
                  } />
                  <Route path="/coordinacion/expedientes/:id" element={
                    <ProtectedRoute allowedRoles={['COORDINADOR', 'DIRECTOR', 'ADMIN_SISTEMA', 'COMITE_PRACTICAS']}>
                      <DetalleExpediente />
                    </ProtectedRoute>
                  } />

                  <Route
                    path="/admin/sedes"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionSedes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/empresas"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionEmpresas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/convenios"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionConvenios />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reportes"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <AdminReportesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/expedientes"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <GestionExpedientes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/expedientes/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                        <DetalleExpediente />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/comite/panel" element={
                    <ProtectedRoute allowedRoles={['COMITE_PRACTICAS']}>
                      <PanelComite />
                    </ProtectedRoute>
                  } />
                  <Route path="/comite/evaluaciones/:id" element={
                    <ProtectedRoute allowedRoles={['COMITE_PRACTICAS']}>
                      <EvaluacionComite />
                    </ProtectedRoute>
                  } />
                  <Route path="/secretaria/recepcion" element={
                    <ProtectedRoute allowedRoles={['SECRETARIA', 'ADMINISTRADOR', 'ADMIN_SISTEMA']}>
                      <RecepcionAdministrativa />
                    </ProtectedRoute>
                  } />

                  {/* Tutor externo */}
                  <Route
                    path="/tutor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <DashboardTutor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tutor/evaluaciones"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <ListaPracticantes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tutor/practicantes"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <ListaPracticantes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tutor/evaluaciones/:id"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <EvaluacionTutorExterno />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tutor/horas/:idExpediente"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <ValidacionHorasTutor />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Raíz → login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProviderWrapper>
      </AppThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
