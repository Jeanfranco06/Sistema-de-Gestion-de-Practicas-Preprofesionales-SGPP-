import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
              <Route path="/estudiante/documentos" element={<PaginaEnConstruccion titulo="Documentos" />} />
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
              <Route path="/docente/documentos" element={<PaginaEnConstruccion titulo="Documentos" />} />
              <Route path="/docente/evaluaciones" element={<PaginaEnConstruccion titulo="Evaluaciones" />} />

              {/* Admin / otros roles */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                    <PaginaEnConstruccion titulo="Dashboard Administrativo" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'COORDINADOR', 'DIRECTOR']}>
                    <GestionUsuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tutores"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'COORDINADOR', 'DIRECTOR']}>
                    <GestionTutores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/validar-requisitos"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'SECRETARIA']}>
                    <ValidarRequisitos />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/expedientes" element={<PaginaEnConstruccion titulo="Expedientes" />} />
              <Route
                path="/admin/sedes"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                    <GestionSedes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/empresas"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
                    <GestionEmpresas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/convenios"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS', 'COORDINADOR', 'DIRECTOR']}>
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
