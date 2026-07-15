import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import theme from './shared/theme/theme';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './modules/shared/layout/AppLayout';
import LoginPage from './modules/auth/LoginPage';
import ForgotPasswordPage from './modules/auth/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/ResetPasswordPage';
import DashboardEstudiante from './modules/estudiante/DashboardEstudiante';
import DashboardDocente from './modules/docente/pages/DashboardDocente';
import DashboardTutor from './modules/tutor/pages/DashboardTutor';
import NoAutorizado from './modules/shared/NoAutorizado';
import PaginaEnConstruccion from './modules/shared/PaginaEnConstruccion';
import MiPerfil from './modules/shared/MiPerfil';
import MiPractica from './modules/estudiante/pages/MiPractica';
import RegistroHoras from './modules/estudiante/pages/RegistroHoras';
import EvaluacionEstudiante from './modules/estudiante/pages/EvaluacionEstudiante';
import DashboardDocente from './modules/docente/DashboardDocente';
import DashboardTutor from './modules/tutor/DashboardTutor';
import { CatalogoSedes } from './modules/sedes/pages/CatalogoSedes';
import { GestionSedes } from './modules/sedes/pages/GestionSedes';
import { GestionEmpresas } from './modules/sedes/pages/GestionEmpresas';
import { GestionConvenios } from './modules/sedes/pages/GestionConvenios';
import { GestionUsuarios } from './modules/admin/pages/GestionUsuarios';
import { GestionTutores } from './modules/admin/pages/GestionTutores';
import { ValidarRequisitos } from './modules/secretaria/pages/ValidarRequisitos';
import { GestionDocumental } from './modules/estudiante/pages/GestionDocumental';
import { InformesPeriodicos } from './modules/estudiante/pages/InformesPeriodicos';
import { RevisionDocumental } from './modules/shared/pages/RevisionDocumental';
import { EvaluacionTutorExterno } from './modules/evaluacion/EvaluacionTutorExterno';
import { EvaluacionDocenteAsesor } from './modules/evaluacion/EvaluacionDocenteAsesor';
import { ListaPracticantes } from './modules/evaluacion/ListaPracticantes';
import { PanelComite } from './modules/comite/pages/PanelComite';
import { RecepcionAdministrativa } from './modules/secretaria/pages/RecepcionAdministrativa';
import { DashboardCoordinacion } from './modules/coordinacion/pages/DashboardCoordinacion';
import { ReportesCoordinacion } from './modules/coordinacion/pages/Reportes';
import { DetalleExpediente } from './modules/coordinacion/pages/DetalleExpediente';
import AdminDashboardPage from './modules/admin/pages/AdminDashboardPage';
import AdminReportesPage from './modules/admin/pages/AdminReportesPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
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
              <Route path="/estudiante/documentos" element={
                <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                  <GestionDocumental />
                </ProtectedRoute>
              } />
              <Route path="/estudiante/informes" element={
                <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
                  <InformesPeriodicos />
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
                  <ProtectedRoute allowedRoles={['ADMIN_SISTEMA']}>
                    <GestionUsuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tutores"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'COORDINADOR', 'DIRECTOR']}>
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
              <Route path="/docente/documentos/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO']}>
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
              <Route path="/comite/panel" element={
                <ProtectedRoute allowedRoles={['COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                  <PanelComite />
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

              <Route path="/perfil" element={<MiPerfil />} />
            </Route>

            {/* Raíz → login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
