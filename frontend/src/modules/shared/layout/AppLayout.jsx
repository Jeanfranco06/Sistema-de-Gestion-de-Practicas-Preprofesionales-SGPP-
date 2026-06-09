import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Menu, MenuItem, Badge, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Dashboard, Assignment, Description, Assessment,
  Business, Notifications, AccountCircle, Logout, ChevronLeft,
  School, AccessTime, CheckCircle, BarChart, ViewSidebar,
  People, SupervisorAccount, FactCheck
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import PageContainer from '../../../shared/components/PageContainer';

const DRAWER_WIDTH = 240;

const NAV_ITEMS_ESTUDIANTE = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/estudiante/dashboard' },
  { label: 'Mi Práctica', icon: <Assignment />, path: '/estudiante/practica' },
  { label: 'Documentos', icon: <Description />, path: '/estudiante/documentos' },
  { label: 'Registro de Horas', icon: <AccessTime />, path: '/estudiante/horas' },
  { label: 'Evaluación', icon: <CheckCircle />, path: '/estudiante/evaluacion' },
  { label: 'Sedes / Empresas', icon: <Business />, path: '/estudiante/sedes' },
];

const NAV_ITEMS_DOCENTE = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/docente/dashboard' },
  { label: 'Mis Practicantes', icon: <School />, path: '/docente/practicantes' },
  { label: 'Documentos', icon: <Description />, path: '/docente/documentos' },
  { label: 'Evaluaciones', icon: <Assessment />, path: '/docente/evaluaciones' },
];

const NAV_ITEMS_ADMIN = [
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
  { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
  { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
  { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
  { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
];

function getNavItems(roles = []) {
  const roleNames = roles.map(r => typeof r === 'string' ? r : r.authority || r.nombre || '');
  
  if (roleNames.some(rn => rn === 'ADMIN_SISTEMA' || rn === 'ROLE_ADMIN_SISTEMA')) return NAV_ITEMS_ADMIN;
  if (roleNames.some(rn => rn === 'ADMINISTRADOR' || rn === 'ROLE_ADMINISTRADOR')) return NAV_ITEMS_ADMIN;
  if (roleNames.some(rn => rn === 'ESTUDIANTE' || rn === 'ROLE_ESTUDIANTE')) return NAV_ITEMS_ESTUDIANTE;
  if (roleNames.some(rn => rn === 'DOCENTE_ASESOR' || rn === 'ROLE_DOCENTE_ASESOR')) return NAV_ITEMS_DOCENTE;
  
  const isAdminRole = roleNames.some(rn => 
    ['SECRETARIA', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS'].some(adminR => rn === adminR || rn === `ROLE_${adminR}`)
  );

  if (isAdminRole) {
    return roleNames.some(rn => rn === 'SECRETARIA' || rn === 'ROLE_SECRETARIA') ? NAV_ITEMS_SECRETARIA : NAV_ITEMS_ADMIN;
  }
  
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
  const [notifAnchor, setNotifAnchor] = useState(null);

  const navItems = getNavItems(user?.roles);
  const sidebarVisible = drawerOpen && !isMobile;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          bgcolor: 'primary.main', px: 2, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
            SGPP – UNT
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Ing. Industrial
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2, bgcolor: '#f0f4f8', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 38, height: 38, fontSize: '0.9rem' }}>
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
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                    '&:hover': { bgcolor: 'primary.light' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: active ? '#fff' : 'text.secondary' }}>
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
            variant="h6"
            fontWeight={600}
            color="primary.main"
            noWrap
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            {navItems.find((n) => n.path === location.pathname)?.label || 'SGPP'}
          </Typography>

          {/* Acciones alineadas a la derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 'auto' }}>
            <Tooltip title="Notificaciones">
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: 'text.primary' }}
                aria-label="Ver notificaciones"
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { width: 300, borderRadius: 2, mt: 1 } } }}
            >
              {[
                'Plan de Prácticas pendiente de revisión',
                'Informe Parcial – plazo en 3 días',
                'Observación recibida en Documento #2',
              ].map((msg, i) => (
                <MenuItem key={i} onClick={() => setNotifAnchor(null)} sx={{ whiteSpace: 'normal', py: 1.5 }}>
                  <Typography variant="body2">{msg}</Typography>
                </MenuItem>
              ))}
            </Menu>

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
