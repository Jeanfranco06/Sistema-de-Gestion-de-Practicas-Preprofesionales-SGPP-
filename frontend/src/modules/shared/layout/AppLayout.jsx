import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Menu, MenuItem, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Dashboard, Assignment, Description, Assessment,
  Business, AccountCircle, Logout, Menu as MenuIcon,
  School, AccessTime, CheckCircle, BarChart,
  People, SupervisorAccount, FactCheck, FolderOpen
} from '@mui/icons-material';
import { useAuth } from '../../../auth/AuthContext';
import PageContainer from '../../../shared/components/PageContainer';
import { NotificationsMenu } from '../components/NotificationsMenu';

const DRAWER_WIDTH_EXPANDED = 260;
const DRAWER_WIDTH_COLLAPSED = 76;

// Estructuración lógica por grupos y roles
function getNavGroups(roles = []) {
  const roleNames = roles.map(r => typeof r === 'string' ? r : r.authority || r.nombre || '').map(r => r.replace(/^ROLE_/, ''));

  if (roleNames.includes('ESTUDIANTE')) {
    return [
      {
        group: 'General',
        items: [{ label: 'Dashboard', icon: <Dashboard />, path: '/estudiante/dashboard' }]
      },
      {
        group: 'Gestión Académica',
        items: [
          { label: 'Mi Práctica', icon: <Assignment />, path: '/estudiante/practica' },
          { label: 'Solicitar Práctica', icon: <Assignment />, path: '/estudiante/solicitar-practica' },
          { label: 'Documentos', icon: <Description />, path: '/estudiante/documentos' },
          { label: 'Registro de Horas', icon: <AccessTime />, path: '/estudiante/horas' },
          { label: 'Informes', icon: <Assessment />, path: '/estudiante/informes' },
        ]
      },
      {
        group: 'Institucional',
        items: [
          { label: 'Evaluación', icon: <CheckCircle />, path: '/estudiante/evaluacion' },
          { label: 'Centros de Práctica', icon: <Business />, path: '/estudiante/sedes' },
        ]
      }
    ];
  }

  if (roleNames.includes('ADMIN_SISTEMA') || roleNames.includes('ADMINISTRADOR')) {
    return [
      {
        group: 'Principal',
        items: [{ label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' }]
      },
      {
        group: 'Operaciones',
        items: [
          { label: 'Recepción Admin', icon: <FolderOpen />, path: '/secretaria/recepcion' },
          { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
          { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
        ]
      },
      {
        group: 'Entidades Externas',
        items: [
          { label: 'Tutores Externos', icon: <SupervisorAccount />, path: '/admin/tutores' },
          { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
          { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
          { label: 'Convenios', icon: <Description />, path: '/admin/convenios' },
        ]
      },
      {
        group: 'Configuración',
        items: [
          { label: 'Usuarios', icon: <People />, path: '/admin/usuarios' },
          { label: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
        ]
      }
    ];
  }

  if (roleNames.includes('SECRETARIA')) {
    return [
      {
        group: 'Principal',
        items: [
          { label: 'Dashboard Administrativo', icon: <Dashboard />, path: '/admin/dashboard' },
          { label: 'Reportes Consolidados', icon: <BarChart />, path: '/admin/reportes' },
        ]
      },
      {
        group: 'Operaciones',
        items: [
          { label: 'Recepción Admin', icon: <FolderOpen />, path: '/secretaria/recepcion' },
          { label: 'Validar Requisitos', icon: <FactCheck />, path: '/admin/validar-requisitos' },
          { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
        ]
      },
      {
        group: 'Entidades Externas',
        items: [
          { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
          { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
        ]
      }
    ];
  }

  if (roleNames.includes('COORDINADOR') || roleNames.includes('DIRECTOR')) {
    return [
      {
        group: 'Dirección',
        items: [
          { label: 'Panel Ejecutivo', icon: <Dashboard />, path: '/coordinacion/dashboard' },
          { label: 'Reportes Consolidados', icon: <Assessment />, path: '/coordinacion/reportes' },
          { label: 'Panel Comité', icon: <FactCheck />, path: '/comite/panel' },
        ]
      },
      {
        group: 'Supervisión',
        items: [
          { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
          { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
          { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
        ]
      }
    ];
  }

  if (roleNames.includes('COMITE_PRACTICAS')) {
    return [
      {
        group: 'Comité',
        items: [
          { label: 'Panel Comité', icon: <FactCheck />, path: '/comite/panel' },
          { label: 'Panel Ejecutivo', icon: <Dashboard />, path: '/coordinacion/dashboard' },
          { label: 'Reportes Consolidados', icon: <BarChart />, path: '/coordinacion/reportes' },
        ]
      },
      {
        group: 'Consultas',
        items: [
          { label: 'Expedientes', icon: <Assignment />, path: '/admin/expedientes' },
          { label: 'Empresas', icon: <Business />, path: '/admin/empresas' },
          { label: 'Sedes', icon: <Business />, path: '/admin/sedes' },
        ]
      }
    ];
  }

  if (roleNames.includes('DOCENTE_ASESOR')) {
    return [
      {
        group: 'Seguimiento',
        items: [
          { label: 'Dashboard', icon: <Dashboard />, path: '/docente/dashboard' },
          { label: 'Mis Practicantes', icon: <School />, path: '/docente/practicantes' },
        ]
      }
    ];
  }

  if (roleNames.includes('TUTOR_EXTERNO')) {
    return [
      {
        group: 'Supervisión',
        items: [
          { label: 'Dashboard', icon: <Dashboard />, path: '/tutor/dashboard' },
          { label: 'Evaluaciones', icon: <Assessment />, path: '/tutor/evaluaciones' },
        ]
      }
    ];
  }

  // Fallback
  return [{ group: 'General', items: [{ label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' }] }];
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navGroups = getNavGroups(user?.roles);
  const drawerWidth = collapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: null });
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const NavItem = ({ item, collapsed }) => {
    const active = location.pathname === item.path;
    const content = (
      <ListItemButton
        onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
        sx={{
          minHeight: 44,
          mx: collapsed ? 1 : 1.5,
          my: 0.25,
          px: collapsed ? 0 : 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 1.5,
          position: 'relative',
          bgcolor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          color: active ? 'primary.main' : 'text.secondary',
          transition: 'background-color 0.2s, color 0.2s',
          '&:hover': {
            bgcolor: active ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0,0,0,0.04)',
          },
          ...(active && !collapsed && {
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '60%',
              width: 4,
              bgcolor: 'primary.main',
              borderRadius: '0 4px 4px 0',
            }
          })
        }}
        aria-current={active ? 'page' : undefined}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 2,
            justifyContent: 'center',
            color: active ? 'primary.main' : 'inherit',
            '& svg': { fontSize: 22 }
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={item.label}
            slotProps={{
              primaryTypography: {
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500
              }
            }}
          />
        )}
        {item.badge && !collapsed && (
          <Box sx={{
            bgcolor: 'error.main', color: 'white', fontSize: '0.7rem',
            fontWeight: 700, px: 1, py: 0.25, borderRadius: 10, lineHeight: 1
          }}>
            {item.badge}
          </Box>
        )}
        {item.badge && collapsed && (
          <Box sx={{ position: 'absolute', top: 8, right: 12, width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%', border: '2px solid white' }} />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={item.label} placement="right" arrow>
        <ListItem disablePadding sx={{ display: 'block' }}>
          {content}
        </ListItem>
      </Tooltip>
    ) : (
      <ListItem disablePadding sx={{ display: 'block' }}>
        {content}
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>

      {/* Header Sidebar */}
      <Box sx={{
        height: { xs: 56, sm: 64 }, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 0 : 2.5,
        borderBottom: '1px solid', borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#1a365d', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} color="white">SG</Typography>
          </Box>
          {!collapsed && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap sx={{ lineHeight: 1.2 }}>
                SGPP UNT
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                Ing. Industrial
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navegación por Grupos */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 2 }}>
        {navGroups.map((group, index) => (
          <Box key={group.group} sx={{ mb: 2 }}>
            {!collapsed && (
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{ px: 3, display: 'block', mb: 0.5, fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, lineHeight: 1.5 }}
              >
                {group.group}
              </Typography>
            )}
            {collapsed && index > 0 && <Divider sx={{ mx: 2, my: 1 }} />}
            <List disablePadding>
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} collapsed={collapsed} />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Perfil Usuario Fixed Bottom */}
      <Box sx={{ p: collapsed ? 1 : 2 }}>
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: collapsed ? 0.5 : 1, borderRadius: 2, cursor: 'pointer',
            transition: 'background 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.85rem', flexShrink: 0 }}>
            {getInitials(user?.nombres, user?.apellidoPaterno)}
          </Avatar>
          {!collapsed && (
            <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                {user?.nombres?.split(' ')[0]} {user?.apellidoPaterno}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, textTransform: 'capitalize' }} noWrap>
                {(typeof user?.roles?.[0] === 'string' ? user.roles[0] : user?.roles?.[0]?.authority || '').replace(/_/g, ' ').toLowerCase()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Menu desplegable de perfil flotante */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 2, mb: 1, ml: 1, minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid', borderColor: 'divider' } } }}
      >
        <Box sx={{ px: 2, py: 1.5, outline: 'none' }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {user?.nombres} {user?.apellidoPaterno}
          </Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/estudiante/perfil'); }} sx={{ py: 1.5 }}>
          <AccountCircle sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} /> <Typography variant="body2" fontWeight={500}>Mi perfil</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} /> <Typography variant="body2" fontWeight={500}>Cerrar sesión</Typography>
        </MenuItem>
      </Menu>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
          <IconButton
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ color: 'text.primary', mr: 2 }}
            aria-label="toggle menu"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" fontWeight={600} color="text.primary" noWrap sx={{ flexGrow: 1 }}>
            {navGroups.flatMap(g => g.items).find((n) => n.path === location.pathname)?.label || 'Sistema de Gestión'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH_EXPANDED, boxSizing: 'border-box', borderRight: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.05)' },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.standard,
                }),
                overflowX: 'hidden'
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' },
          p: { xs: 1, sm: 2, md: 2 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
