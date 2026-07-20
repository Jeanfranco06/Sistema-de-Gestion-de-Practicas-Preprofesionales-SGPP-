import { useState, useCallback, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, Menu, MenuItem, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import {
  LayoutDashboard, FileText, BarChart3,
  Building2, UserCircle, LogOut, Menu as MenuIcon,
  GraduationCap, Clock, Users,
  UserCheck, ClipboardCheck, FolderOpen,
  Moon, Sun, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { useThemeContext } from '../../../shared/theme/ThemeContext';
import { NotificationsMenu } from '../components/NotificationsMenu';
import { Button, Avatar, Badge } from '../../../ui';
import { cn } from '../../../lib/utils';

const TOP_BAR_HEIGHT = 64;
const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 88;

type UserRole = string | { authority?: string; nombre?: string };

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

interface NavGroup {
  group: string;
  label: string;
  items: NavItem[];
}

interface User {
  nombres?: string;
  apellidoPaterno?: string;
  email?: string;
  roles?: UserRole[];
}

function getNavGroups(roles: UserRole[] = []): NavGroup[] {
  const roleNames = roles
    .map(r => (typeof r === 'string' ? r : r.authority || r.nombre || ''))
    .map(r => r.replace(/^ROLE_/, ''));

  const isEstudiante = roleNames.includes('ESTUDIANTE');
  const isAdmin = roleNames.includes('ADMIN_SISTEMA') || roleNames.includes('ADMINISTRADOR');
  const isSecretaria = roleNames.includes('SECRETARIA');
  const isCoordinador = roleNames.includes('COORDINADOR') || roleNames.includes('DIRECTOR');
  const isComite = roleNames.includes('COMITE_PRACTICAS');
  const isDocente = roleNames.includes('DOCENTE_ASESOR');
  const isTutor = roleNames.includes('TUTOR_EXTERNO');

  if (isEstudiante) {
    return [
      { group: 'general', label: 'General', items: [{ label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/estudiante/dashboard' }] },
      { group: 'academic', label: 'Gestión Académica', items: [
        { label: 'Mi Práctica', icon: <Briefcase size={22} />, path: '/estudiante/practica' },
        { label: 'Solicitar Práctica', icon: <FileCheck size={22} />, path: '/estudiante/solicitar-practica' },
        { label: 'Plan de Prácticas', icon: <ClipboardList size={22} />, path: '/estudiante/plan-practicas' },
        { label: 'Documentos', icon: <FileText size={22} />, path: '/estudiante/documentos' },
        { label: 'Registro de Horas', icon: <Clock size={22} />, path: '/estudiante/horas' },
        { label: 'Informes', icon: <FileText size={22} />, path: '/estudiante/informes' },
      ]},
      { group: 'institutional', label: 'Institucional', items: [
        { label: 'Centros de Práctica', icon: <MapPin size={22} />, path: '/estudiante/sedes' },
        { label: 'Empresas Receptoras', icon: <Building2 size={22} />, path: '/estudiante/sedes' },
      ]},
    ];
  }

  if (isAdmin) {
    return [
      { group: 'main', label: 'Principal', items: [{ label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/admin/dashboard' }] },
      { group: 'operations', label: 'Operaciones', items: [
        { label: 'Recepción Admin', icon: <FolderOpen size={22} />, path: '/secretaria/recepcion' },
        { label: 'Validar Requisitos', icon: <ClipboardCheck size={22} />, path: '/admin/validar-requisitos' },
        { label: 'Expedientes', icon: <ClipboardList size={22} />, path: '/admin/expedientes' },
      ]},
      { group: 'external', label: 'Entidades Externas', items: [
        { label: 'Tutores Externos', icon: <UserCheck size={22} />, path: '/admin/tutores' },
        { label: 'Empresas', icon: <Building2 size={22} />, path: '/admin/empresas' },
        { label: 'Sedes', icon: <Building2 size={22} />, path: '/admin/sedes' },
        { label: 'Convenios', icon: <FileText size={22} />, path: '/admin/convenios' },
      ]},
      { group: 'config', label: 'Configuración', items: [
        { label: 'Usuarios', icon: <Users size={22} />, path: '/admin/usuarios' },
        { label: 'Reportes', icon: <BarChart3 size={22} />, path: '/admin/reportes' },
      ]},
    ];
  }

  if (isSecretaria) {
    return [
      { group: 'main', label: 'Principal', items: [
        { label: 'Dashboard Administrativo', icon: <LayoutDashboard size={22} />, path: '/admin/dashboard' },
        { label: 'Reportes Consolidados', icon: <BarChart3 size={22} />, path: '/admin/reportes' },
      ]},
      { group: 'operations', label: 'Operaciones', items: [
        { label: 'Recepción Admin', icon: <FolderOpen size={22} />, path: '/secretaria/recepcion' },
        { label: 'Validar Requisitos', icon: <ClipboardCheck size={22} />, path: '/admin/validar-requisitos' },
        { label: 'Expedientes', icon: <ClipboardList size={22} />, path: '/admin/expedientes' },
      ]},
      { group: 'external', label: 'Entidades Externas', items: [
        { label: 'Empresas', icon: <Building2 size={22} />, path: '/admin/empresas' },
        { label: 'Sedes', icon: <Building2 size={22} />, path: '/admin/sedes' },
      ]},
    ];
  }

  if (isCoordinador) {
    return [
      { group: 'direction', label: 'Dirección', items: [
        { label: 'Coordinación', icon: <LayoutDashboard size={22} />, path: '/coordinacion/dashboard' },
        { label: 'Reportes Consolidados', icon: <BarChart3 size={22} />, path: '/coordinacion/reportes' },
        { label: 'Panel Comité', icon: <ClipboardCheck size={22} />, path: '/comite/panel' },
      ]},
      { group: 'supervision', label: 'Supervisión', items: [
        { label: 'Expedientes', icon: <ClipboardList size={22} />, path: '/admin/expedientes' },
        { label: 'Empresas', icon: <Building2 size={22} />, path: '/admin/empresas' },
        { label: 'Sedes', icon: <Building2 size={22} />, path: '/admin/sedes' },
      ]},
    ];
  }

  if (isComite) {
    return [
      { group: 'comite', label: 'Comité', items: [
        { label: 'Panel Comité', icon: <ClipboardCheck size={22} />, path: '/comite/panel' },
        ...(roleNames.includes('DOCENTE_ASESOR')
          ? [{ label: 'Mis Practicantes', icon: <GraduationCap size={22} />, path: '/docente/practicantes' }]
          : []),
        { label: 'Coordinación', icon: <LayoutDashboard size={22} />, path: '/coordinacion/dashboard' },
        { label: 'Reportes Consolidados', icon: <BarChart3 size={22} />, path: '/coordinacion/reportes' },
      ]},
      { group: 'queries', label: 'Consultas', items: [
        { label: 'Expedientes', icon: <ClipboardList size={22} />, path: '/admin/expedientes' },
        { label: 'Empresas', icon: <Building2 size={22} />, path: '/admin/empresas' },
        { label: 'Sedes', icon: <Building2 size={22} />, path: '/admin/sedes' },
      ]},
    ];
  }

  if (isDocente) {
    return [
      { group: 'tracking', label: 'Seguimiento', items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/docente/dashboard' },
        { label: 'Mis Practicantes', icon: <GraduationCap size={22} />, path: '/docente/practicantes' },
      ]},
    ];
  }

  if (isTutor) {
    return [
      { group: 'supervision', label: 'Supervisión', items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/tutor/dashboard' },
        { label: 'Evaluaciones', icon: <BarChart3 size={22} />, path: '/tutor/evaluaciones' },
      ]},
    ];
  }

  return [{ group: 'general', label: 'General', items: [{ label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/admin/dashboard' }] }];
}

function getInitials(nombres = '', apellido = ''): string {
  return `${nombres.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

function getPerfilRoute(roles: UserRole[] = []): string {
  const roleNames = roles
    .map(r => (typeof r === 'string' ? r : r.authority || r.nombre || ''))
    .map(r => r.replace(/^ROLE_/, ''));
  if (roleNames.includes('ESTUDIANTE')) return '/estudiante/perfil';
  if (roleNames.includes('DOCENTE_ASESOR')) return '/docente/dashboard';
  if (roleNames.includes('TUTOR_EXTERNO')) return '/tutor/dashboard';
  if (roleNames.includes('COORDINADOR') || roleNames.includes('DIRECTOR')) return '/coordinacion/dashboard';
  if (roleNames.includes('COMITE_PRACTICAS')) return '/comite/panel';
  if (roleNames.includes('SECRETARIA')) return '/admin/dashboard';
  return '/admin/dashboard';
}

function formatRole(role: UserRole): string {
  const r = typeof role === 'string' ? role : role.authority || role.nombre || '';
  return r.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase();
}

function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: (path: string) => void;
}) {
  return (
    <li>
      {collapsed ? (
        <Tooltip title={item.label} placement="right" arrow>
          <button
            onClick={() => onClick(item.path)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative w-full flex items-center justify-center h-11 mx-1.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-amber-50 text-blue-900 dark:bg-blue-900/40 dark:text-amber-400 shadow-[inset_0_0_0_1px_rgba(30,58,138,0.15)] dark:shadow-none'
                : 'text-blue-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
            )}
          >
            <span className="[&>svg]:text-[22px] [&>svg]:transition-transform [&>svg]:duration-200">{item.icon}</span>
            {item.badge && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            )}
          </button>
        </Tooltip>
      ) : (
        <button
          onClick={() => onClick(item.path)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative w-full flex items-center gap-3 h-11 mx-1.5 px-3 rounded-xl transition-all duration-200 text-left overflow-hidden',
            isActive
              ? 'bg-amber-50 text-blue-900 dark:bg-blue-900/40 dark:text-amber-400 font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-blue-700 dark:before:bg-amber-400'
              : 'text-blue-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 font-medium'
          )}
        >
          <span className="[&>svg]:text-[22px] [&>svg]:transition-transform [&>svg]:duration-200 shrink-0">{item.icon}</span>
          <span className="text-sm truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="danger" size="sm" className="ml-auto shrink-0">
              {item.badge}
            </Badge>
          )}
        </button>
      )}
    </li>
  );
}

function NavGroup({
  group,
  groupIdx,
  collapsed,
  isActive,
  onClick,
}: {
  group: NavGroup;
  groupIdx: number;
  collapsed: boolean;
  isActive: (path: string) => boolean;
  onClick: (path: string) => void;
}) {
  return (
    <div key={group.group} className="mb-4">
      {!collapsed && (
        <p className="px-3 mb-1.5 text-[0.65rem] uppercase tracking-wider font-bold text-blue-900/80 dark:text-slate-400 leading-relaxed">
          {group.label}
        </p>
      )}
      {collapsed && groupIdx > 0 && <hr className="mx-3 my-2 border-border" />}
      <ul className="space-y-0.5">
        {group.items.map(item => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            collapsed={collapsed}
            onClick={onClick}
          />
        ))}
      </ul>
    </div>
  );
}

function UserProfile({
  user,
  collapsed,
  anchorEl,
  onAnchorClick,
  onCloseMenu,
  onProfileClick,
  onLogout,
}: {
  user: User | null | undefined;
  collapsed: boolean;
  anchorEl: HTMLElement | null;
  onAnchorClick: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseMenu: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}) {
  return (
    <div className={cn('transition-all duration-200 border-t border-border', collapsed ? 'p-2' : 'p-3')}>
      <button
        onClick={onAnchorClick}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl transition-colors duration-150 hover:bg-surface-border',
          collapsed ? 'justify-center p-2' : 'justify-start p-2.5'
        )}
      >
        <Avatar
          fallback={getInitials(user?.nombres, user?.apellidoPaterno)}
          size="md"
          className="bg-blue-900 text-white font-bold hover:bg-blue-800"
        >
          <span className="text-sm tracking-wider">{user?.nombres?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-sm font-bold text-unt-blue dark:text-slate-100 truncate leading-tight">
              {user?.nombres ? `${user.nombres.split(' ')[0]} ${user.apellidos?.split(' ')[0] || ''}` : user?.username}
            </span>
            <span className="text-xs text-unt-blue/80 dark:text-slate-400 truncate leading-tight capitalize">
              {user?.roles?.[0] ? formatRole(user.roles[0]) : 'Usuario'}
            </span>
          </div>
        )}
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mb: 1,
              ml: 1,
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-bold text-foreground">{user?.nombres} {user?.apellidoPaterno}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <MenuItem onClick={() => { onCloseMenu(); onProfileClick(); }} sx={{ py: 1.5 }}>
          <UserCircle size={20} style={{ marginRight: 6 }} />
          <span className="text-sm font-medium text-foreground">Mi perfil</span>
        </MenuItem>
        <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <LogOut size={20} style={{ marginRight: 6 }} />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </MenuItem>
      </Menu>
    </div>
  );
}

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center h-14 md:h-16 border-b border-border shrink-0 transition-all duration-300',
        collapsed ? 'justify-center px-0' : 'justify-start px-5'
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white border-2 border-amber-400 font-extrabold text-sm overflow-hidden">
          <span className="relative z-10">SG</span>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-blue-900 dark:text-amber-400 leading-tight truncate">SGPP UNT</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Ing. Industrial</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DrawerContent({
  navGroups,
  collapsed,
  location,
  onNavClick,
  user,
  anchorEl,
  onAnchorClick,
  onCloseMenu,
  onProfileClick,
  onLogout,
}: {
  navGroups: NavGroup[];
  collapsed: boolean;
  location: Location;
  onNavClick: (path: string) => void;
  user: User | null | undefined;
  anchorEl: HTMLElement | null;
  onAnchorClick: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseMenu: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}) {
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  return (
    <div className="flex flex-col h-full bg-card">
      <SidebarHeader collapsed={collapsed} />
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {navGroups.map((group, idx) => (
          <NavGroup
            key={group.group}
            group={group}
            groupIdx={idx}
            collapsed={collapsed}
            isActive={isActive}
            onClick={onNavClick}
          />
        ))}
      </nav>
      <UserProfile
        user={user}
        collapsed={collapsed}
        anchorEl={anchorEl}
        onAnchorClick={onAnchorClick}
        onCloseMenu={onCloseMenu}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
      />
    </div>
  );
}

function TopBar({
  currentPage,
  onMenuClick,
  onThemeToggle,
  mode,
  drawerWidth,
}: {
  currentPage: string;
  onMenuClick: () => void;
  onThemeToggle: () => void;
  mode: 'light' | 'dark';
  drawerWidth: number;
}) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[1200] flex items-center bg-card/80 backdrop-blur-sm border-b-2 border-primary-600 transition-all duration-300"
      style={{ height: TOP_BAR_HEIGHT }}
    >
      <div className="flex items-center gap-2 px-4 sm:px-6 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          aria-label="toggle menu"
          className="h-10 w-10"
        >
          <MenuIcon size={22} />
        </Button>
        <h1 className="flex-1 text-sm sm:text-base font-bold text-unt-blue dark:text-unt-yellow truncate">
          {currentPage}
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            aria-label={mode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            className="h-9 w-9"
          >
            {mode === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </Button>
          <NotificationsMenu />
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const navGroups = useMemo(() => getNavGroups(user?.roles), [user?.roles]);
  const drawerWidth = collapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true, state: null });
  }, [logout, navigate]);

  const handleDrawerToggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const handleNavClick = useCallback((path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  }, [navigate, isMobile]);

  const handleProfileClick = useCallback(() => {
    navigate(getPerfilRoute(user?.roles));
  }, [navigate, user?.roles]);

  const currentPage = useMemo(
    () => navGroups.flatMap(g => g.items).find(n => n.path === location.pathname)?.label || 'Sistema de Gestión',
    [navGroups, location.pathname]
  );

  const drawerContent = (
    <DrawerContent
      navGroups={navGroups}
      collapsed={collapsed}
      location={location}
      onNavClick={handleNavClick}
      user={user}
      anchorEl={anchorEl}
      onAnchorClick={(e) => setAnchorEl(e.currentTarget)}
      onCloseMenu={() => setAnchorEl(null)}
      onProfileClick={handleProfileClick}
      onLogout={handleLogout}
    />
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Top Bar - Full width, fixed at top */}
      <TopBar
        currentPage={currentPage}
        onMenuClick={handleDrawerToggle}
        onThemeToggle={toggleTheme}
        mode={mode}
        drawerWidth={drawerWidth}
      />

      {/* Side Drawer - Starts below TopBar */}
      <Box
        component="nav"
        style={{
          position: 'fixed',
          top: TOP_BAR_HEIGHT,
          left: 0,
          bottom: 0,
          width: isMobile ? 0 : drawerWidth,
          zIndex: 1100,
          transition: 'width 300ms ease',
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH_EXPANDED,
                boxSizing: 'border-box',
                borderRight: 'none',
                boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
                backgroundColor: 'var(--color-card)',
                height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
                top: TOP_BAR_HEIGHT,
              },
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
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.standard,
                }),
                overflowX: 'hidden',
                height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
                top: TOP_BAR_HEIGHT,
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content - Starts below TopBar, beside Drawer */}
      <main
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginTop: TOP_BAR_HEIGHT,
          marginLeft: isMobile ? 0 : drawerWidth,
          padding: 24,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <div className="flex-1 flex flex-col w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}