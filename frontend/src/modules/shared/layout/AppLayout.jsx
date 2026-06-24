import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Menu, MenuItem, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Dashboard, Assignment, Description, Assessment,
  Business, AccountCircle, Logout, ChevronLeft,
  School, AccessTime, CheckCircle, BarChart, ViewSidebar,
  People, SupervisorAccount, FactCheck
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import PageContainer from '../../../shared/components/PageContainer';
import { NotificationsMenu } from '../components/NotificationsMenu';

const DRAWER_WIDTH = 240;

const NAV_ITEMS_ESTUDIANTE = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/estudiante/dashboard' },
  { label: 'Mi Práctica', icon: <Assignment />, path: '/estudiante/practica' },
  { label: 'Documentos', icon: <Description />, path: '/estudiante/documentos' },
  { label: 'Informes Periódicos', icon: <Assessment />, path: '/estudiante/informes' },
  { label: 'Registro de Horas', icon: <AccessTime />, path: '/estudiante/horas' },
  { label: 'Evaluación', icon: <CheckCircle />, path: '/estudiante/evaluacion' },
  { label: 'Sedes / Empresas', icon: <Business />, path: '/estudiante/sedes' },
];

const NAV_ITEMS_DOCENTE = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/docente/dashboard' },
  { label: 'Mis Practicantes', icon: <School />, path: '/docente/practicantes' },
];

const NAV_ITEMS_ADMIN = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
  { label: 'Tutores Externos', icon: <SupervisorAccount />, path: '/admin/tutores' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
  { label: 'Convenios', icon: <Description />, path: '/admin/convenios' },
  { label: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
];

const NAV_ITEMS_ADMIN_SISTEMA = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
  { label: 'Usuarios', icon: <People />, path: '/admin/usuarios' },
  { label: 'Tutores Externos', icon: <SupervisorAccount />, path: '/admin/tutores' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
  { label: 'Convenios', icon: <Description />, path: '/admin/convenios' },
  { label: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
];

const NAV_ITEMS_SECRETARIA = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
  { label: 'Recepción Admin.', icon: <Assignment />, path: '/secretaria/recepcion' },
  { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
];

const NAV_ITEMS_COMITE = [
  { label: 'Panel Comité', icon: <FactCheck />, path: '/comite/panel' },
  { label: 'Panel Ejecutivo', icon: <Dashboard />, path: '/coordinacion/dashboard' },
  { label: 'Reportes', icon: <BarChart />, path: '/coordinacion/reportes' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
];

const NAV_ITEMS_TUTOR_EXTERNO = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/tutor/dashboard' },
  { label: 'Evaluaciones', icon: <Assessment />, path: '/tutor/evaluaciones' },
];

const NAV_ITEMS_COORDINACION = [
  { label: 'Panel Ejecutivo', icon: <Dashboard />, path: '/coordinacion/dashboard' },
  { label: 'Reportes', icon: <Assessment />, path: '/coordinacion/reportes' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Panel Comité', icon: <FactCheck />, path: '/comite/panel' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
];

function getNavItems(roles = []) {
  const roleNames = roles.map(r => typeof r === 'string' ? r : r.authority || r.nombre || '').map(r => r.replace(/^ROLE_/, ''));

  if (roleNames.includes('ESTUDIANTE')) return NAV_ITEMS_ESTUDIANTE;
  if (roleNames.includes('DOCENTE_ASESOR')) return NAV_ITEMS_DOCENTE;
  if (roleNames.includes('TUTOR_EXTERNO')) return NAV_ITEMS_TUTOR_EXTERNO;
  if (roleNames.includes('COORDINADOR') || roleNames.includes('DIRECTOR')) return NAV_ITEMS_COORDINACION;
  if (roleNames.includes('COMITE_PRACTICAS')) return NAV_ITEMS_COMITE;
  if (roleNames.includes('SECRETARIA')) return NAV_ITEMS_SECRETARIA;
  if (roleNames.includes('ADMIN_SISTEMA')) return NAV_ITEMS_ADMIN_SISTEMA;
  if (roleNames.includes('ADMINISTRADOR')) return NAV_ITEMS_ADMIN;

  return NAV_ITEMS_ADMIN;
}

function getInitials(nombres = '', apellido = '') {
  return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = getNavItems(user?.roles);
  const sidebarVisible = drawerOpen && !isMobile;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: null });
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          px: 2, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2} color="inherit">
            SGPP – UNT
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Ing. Industrial
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'inherit' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'info.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 38, height: 38, fontSize: '0.9rem' }}>
            {getInitials(user?.nombres, user?.apellidoPaterno)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.nombres} {user?.apellidoPaterno}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.roles?.[0]?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, py: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setDrawerOpen(false); }}
                selected={active}
                sx={{ mx: 1, borderRadius: 1.5, mb: 0.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primaryTypography: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 38, color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" slotProps={{ primaryTypography: { fontSize: '0.875rem' } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar fijo: solo compensa el sidebar cuando está visible en desktop */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          width: sidebarVisible ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: sidebarVisible ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 }, gap: 1 }}>
          {/* Toggle sidebar */}
          <Tooltip title={drawerOpen ? 'Contraer menú' : 'Expandir menú'}>
            <IconButton
              onClick={() => setDrawerOpen((p) => !p)}
              sx={{ color: 'text.primary', flexShrink: 0 }}
              edge="start"
              aria-label={drawerOpen ? 'Contraer menú lateral' : 'Expandir menú lateral'}
            >
              {drawerOpen ? <ChevronLeft /> : <ViewSidebar />}
            </IconButton>
          </Tooltip>

          {/* Título de página */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="primary.dark"
            noWrap
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            {navItems.find((n) => n.path === location.pathname)?.label || 'SGPP'}
          </Typography>

          {/* Acciones alineadas a la derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
            <NotificationsMenu />

            <Tooltip title={user?.username}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Menú de usuario"
                sx={{ p: 0.5 }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: '0.85rem' }}>
                  {getInitials(user?.nombres, user?.apellidoPaterno)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { borderRadius: 2, mt: 1, minWidth: 200 } } }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.nombres} {user?.apellidoPaterno}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil'); }}>
                <AccountCircle sx={{ mr: 1, fontSize: 20 }} /> Mi perfil
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1, fontSize: 20 }} /> Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar: en desktop ocupa espacio en el flex; en móvil es overlay */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: sidebarVisible ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenido: sin margin-left extra (el drawer ya reserva su espacio en flex) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          mt: { xs: '56px', sm: '64px' },
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 2, md: 2.5 },
        }}
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </Box>
    </Box>
  );
}
