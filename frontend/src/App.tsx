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
import { ErrorBoundary } from './shared/components/ErrorBoundary';

function lazyNamed<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default?: T; [key: string]: any }>,
  exportName: string
) {
  return React.lazy(() => importFn().then(m => ({ default: m.default ?? m[exportName] })));
}

const DashboardEstudiante = lazyNamed(() => import('./modules/estudiante/DashboardEstudiante'), 'DashboardEstudiante');
const DashboardDocente = lazyNamed(() => import('./modules/docente/pages/DashboardDocente'), 'DashboardDocente');
const CatalogoSedes = lazyNamed(() => import('./modules/sedes/pages/CatalogoSedes'), 'CatalogoSedes');
const SolicitarPractica = lazyNamed(() => import('./modules/estudiante/pages/SolicitarPractica'), 'SolicitarPractica');
const GestionSedes = lazyNamed(() => import('./modules/sedes/pages/GestionSedes'), 'GestionSedes');
const GestionEmpresas = lazyNamed(() => import('./modules/sedes/pages/GestionEmpresas'), 'GestionEmpresas');
const GestionConvenios = lazyNamed(() => import('./modules/sedes/pages/GestionConvenios'), 'GestionConvenios');
const ValidarRequisitos = lazyNamed(() => import('./modules/secretaria/pages/ValidarRequisitos'), 'ValidarRequisitos');
const GestionDocumental = lazyNamed(() => import('./modules/estudiante/pages/GestionDocumental'), 'GestionDocumental');
const InformesPeriodicos = lazyNamed(() => import('./modules/estudiante/pages/InformesPeriodicos'), 'InformesPeriodicos');
const RegistroHoras = lazyNamed(() => import('./modules/estudiante/pages/RegistroHoras'), 'RegistroHoras');
const PerfilEstudiante = lazyNamed(() => import('./modules/estudiante/pages/PerfilEstudiante'), 'PerfilEstudiante');
const MiPractica = lazyNamed(() => import('./modules/estudiante/pages/MiPractica'), 'MiPractica');
const PlanPracticas = lazyNamed(() => import('./modules/estudiante/pages/PlanPracticas'), 'PlanPracticas');
const EvaluacionEstudiante = lazyNamed(() => import('./modules/estudiante/pages/EvaluacionEstudiante'), 'EvaluacionEstudiante');
const RevisionDocumental = lazyNamed(() => import('./modules/shared/pages/RevisionDocumental'), 'RevisionDocumental');
const ListaPracticantes = lazyNamed(() => import('./modules/evaluacion/ListaPracticantes'), 'ListaPracticantes');
const AdminDashboardPage = lazyNamed(() => import('./modules/admin/pages/AdminDashboardPage'), 'AdminDashboardPage');
const DashboardTutor = lazyNamed(() => import('./modules/tutor/pages/DashboardTutor'), 'DashboardTutor');
const ValidacionHorasTutor = lazyNamed(() => import('./modules/tutor/pages/ValidacionHorasTutor'), 'ValidacionHorasTutor');
const ListaValidacionHoras = lazyNamed(() => import('./modules/tutor/pages/ListaValidacionHoras'), 'ListaValidacionHoras');
const EvaluacionTutorExterno = lazyNamed(() => import('./modules/evaluacion/EvaluacionTutorExterno'), 'EvaluacionTutorExterno');
const EvaluacionDocenteAsesor = lazyNamed(() => import('./modules/evaluacion/EvaluacionDocenteAsesor'), 'EvaluacionDocenteAsesor');
const EvaluacionComite = lazyNamed(() => import('./modules/evaluacion/EvaluacionComite'), 'EvaluacionComite');
const PanelComite = lazyNamed(() => import('./modules/comite/pages/PanelComite'), 'PanelComite');
const RecepcionAdministrativa = lazyNamed(() => import('./modules/secretaria/pages/RecepcionAdministrativa'), 'RecepcionAdministrativa');
const DashboardCoordinacion = lazyNamed(() => import('./modules/coordinacion/pages/DashboardCoordinacion'), 'DashboardCoordinacion');
const ReportesCoordinacion = lazyNamed(() => import('./modules/coordinacion/pages/Reportes'), 'ReportesCoordinacion');
const DetalleExpediente = lazyNamed(() => import('./modules/coordinacion/pages/DetalleExpediente'), 'DetalleExpediente');
const AdminReportesPage = lazyNamed(() => import('./modules/admin/pages/AdminReportesPage'), 'AdminReportesPage');
const GestionExpedientes = lazyNamed(() => import('./modules/admin/pages/GestionExpedientes'), 'GestionExpedientes');
const GestionUsuarios = lazyNamed(() => import('./modules/admin/pages/GestionUsuarios'), 'GestionUsuarios');
const GestionTutores = lazyNamed(() => import('./modules/admin/pages/GestionTutores'), 'GestionTutores');
const ConfiguracionSistema = lazyNamed(() => import('./modules/admin/pages/ConfiguracionSistema'), 'ConfiguracionSistema');

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
              <ErrorBoundary>
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
                  <Route path="/estudiante/evaluacion" element={
                    <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                      <EvaluacionEstudiante />
                    </ProtectedRoute>
                  } />
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
                    path="/tutor/horas"
                    element={
                      <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                        <ListaValidacionHoras />
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
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProviderWrapper>
      </AppThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
