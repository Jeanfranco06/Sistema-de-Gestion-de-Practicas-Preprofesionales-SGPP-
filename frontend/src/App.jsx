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
import DashboardEstudiante from './modules/estudiante/DashboardEstudiante';
import NoAutorizado from './modules/shared/NoAutorizado';
import PaginaEnConstruccion from './modules/shared/PaginaEnConstruccion';
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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<LoginPage />} />
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
              <Route path="/estudiante/practica" element={<PaginaEnConstruccion titulo="Mi Práctica" />} />
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
              <Route path="/estudiante/horas" element={<PaginaEnConstruccion titulo="Registro de Horas" />} />
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
                    <PaginaEnConstruccion titulo="Dashboard Docente" />
                  </ProtectedRoute>
                }
              />
              <Route path="/docente/practicantes" element={<PaginaEnConstruccion titulo="Mis Practicantes" />} />
              <Route path="/docente/documentos" element={
                <ProtectedRoute allowedRoles={['DOCENTE_ASESOR']}>
                  <RevisionDocumental />
                </ProtectedRoute>
              } />
              <Route path="/docente/evaluaciones" element={<PaginaEnConstruccion titulo="Evaluaciones" />} />

              {/* Admin / otros roles */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                    <PaginaEnConstruccion titulo="Dashboard Administrativo" />
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
              <Route path="/admin/expedientes" element={
                <ProtectedRoute allowedRoles={['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                  <RevisionDocumental />
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
              <Route path="/admin/reportes" element={<PaginaEnConstruccion titulo="Reportes" />} />

              {/* Tutor externo */}
              <Route
                path="/tutor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TUTOR_EXTERNO']}>
                    <PaginaEnConstruccion titulo="Panel Tutor Externo" />
                  </ProtectedRoute>
                }
              />

              <Route path="/perfil" element={<PaginaEnConstruccion titulo="Mi Perfil" />} />
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
