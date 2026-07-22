import { useState, useCallback, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CommandPalette } from '../../../components/CommandPalette';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { Box, Drawer, Menu, MenuItem, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import {
  LayoutDashboard, FileText, BarChart3,
  Building2, UserCircle, LogOut, Menu as MenuIcon,
  GraduationCap, Clock, Users,
  UserCheck, ClipboardCheck, FolderOpen,
  ClipboardList,
  Briefcase, FileCheck, MapPin,
  Settings, Award,
} from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { NotificationsMenu } from '../components/NotificationsMenu';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { CurrentUserAvatar } from '../../../components/CurrentUserAvatar';
import { Button, Badge } from '../../../ui';
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
  id?: number;
  nombres?: string;
  apellidoPaterno?: string;
  apellidos?: string;
  username?: string;
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
        { label: 'Mis Evaluaciones', icon: <Award size={22} />, path: '/estudiante/evaluacion' },
      ]},
      { group: 'institutional', label: 'Institucional', items: [
        { label: 'Centros de Práctica', icon: <MapPin size={22} />, path: '/estudiante/sedes' },
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
        { label: 'Sistema', icon: <Settings size={22} />, path: '/admin/configuracion' },
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

  if (isDocente) {
    return [
      { group: 'tracking', label: 'Seguimiento', items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/docente/dashboard' },
        { label: 'Mis Practicantes', icon: <GraduationCap size={22} />, path: '/docente/practicantes' },
        ...(roleNames.includes('COMITE_PRACTICAS')
          ? [
              { label: 'Panel Comité', icon: <ClipboardCheck size={22} />, path: '/comite/panel' },
              { label: 'Coordinación', icon: <LayoutDashboard size={22} />, path: '/coordinacion/dashboard' },
              { label: 'Reportes Consolidados', icon: <BarChart3 size={22} />, path: '/coordinacion/reportes' }
            ]
          : []),
      ]},
      ...(roleNames.includes('COMITE_PRACTICAS')
        ? [{ group: 'queries', label: 'Consultas', items: [
            { label: 'Expedientes', icon: <ClipboardList size={22} />, path: '/admin/expedientes' },
            { label: 'Empresas', icon: <Building2 size={22} />, path: '/admin/empresas' },
            { label: 'Sedes', icon: <Building2 size={22} />, path: '/admin/sedes' },
          ]}]
        : [])
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

  if (isTutor) {
    return [
      { group: 'supervision', label: 'Supervisión', items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/tutor/dashboard' },
        { label: 'Mis Practicantes', icon: <GraduationCap size={22} />, path: '/tutor/practicantes' },
        { label: 'Validación de Horas', icon: <Clock size={22} />, path: '/tutor/horas' },
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
  return '/perfil';
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
                ? 'bg-primary-100/70 text-[var(--color-unt-blue)] dark:bg-[var(--color-unt-blue)]/20 dark:text-primary-300 shadow-sm'
                : 'text-[var(--color-unt-blue)] hover:bg-muted dark:text-[var(--color-unt-blue-light)] dark:hover:bg-muted'
            )}
          >
            <span className="[&>svg]:text-[22px] [&>svg]:transition-transform [&>svg]:duration-200">{item.icon}</span>
            {item.badge && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-[var(--color-card)]" />
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
              ? 'bg-primary-100/70 text-[var(--color-unt-blue)] dark:bg-[var(--color-unt-blue)]/20 dark:text-primary-300 font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-[var(--color-unt-blue)] dark:before:bg-primary-300'
              : 'text-[var(--color-unt-blue)] hover:bg-muted dark:text-[var(--color-unt-blue-light)] dark:hover:bg-muted font-medium'
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
        <p className="px-3 mb-1.5 text-[0.65rem] uppercase tracking-wider font-bold text-[var(--color-unt-blue)]/80 dark:text-muted-foreground leading-relaxed">
          {group.label}
        </p>
      )}
      {collapsed && groupIdx > 0 && <hr className="mx-3 my-2 border-[var(--color-border)]" />}
      <ul className="space-y-0.5">
        {group.items.map((item, idx) => (
          <NavItem
            key={`${group.group}-${idx}-${item.path}`}
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
  const primaryRole = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return 'Usuario';
    const priorityList = ['ESTUDIANTE', 'DOCENTE_ASESOR', 'TUTOR_EXTERNO', 'COORDINADOR', 'DIRECTOR', 'COMITE_PRACTICAS', 'SECRETARIA', 'ADMIN_SISTEMA', 'ADMINISTRADOR'];
    let bestIndex = 999;
    let bestRole = user.roles[0];
    
    user.roles.forEach(role => {
      const name = (typeof role === 'string' ? role : role.authority || role.nombre || '').replace(/^ROLE_/, '');
      const idx = priorityList.indexOf(name);
      if (idx !== -1 && idx < bestIndex) {
        bestIndex = idx;
        bestRole = role;
      }
    });
    return formatRole(bestRole);
  }, [user?.roles]);

  return (
    <div className={cn('transition-all duration-200 border-t border-[var(--color-border)]', collapsed ? 'p-2' : 'p-3')}>
      <button
        onClick={onAnchorClick}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl transition-colors duration-150 hover:bg-muted',
          collapsed ? 'justify-center p-2' : 'justify-start p-2.5'
        )}
      >
        <CurrentUserAvatar
          userId={user?.id}
          fallback={getInitials(user?.nombres, user?.apellidoPaterno)}
          size="md"
          className="bg-[var(--color-unt-blue)] text-white font-bold hover:bg-[var(--color-unt-blue-light)] dark:bg-[var(--color-unt-blue-light)] dark:hover:bg-[var(--color-unt-blue)]"
        />
        {!collapsed && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-sm font-bold text-foreground truncate leading-tight">
              {user?.nombres ? `${user.nombres.split(' ')[0]} ${user.apellidos?.split(' ')[0] || ''}` : user?.username}
            </span>
            <span className="text-xs text-muted-foreground truncate leading-tight capitalize">
              {primaryRole}
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
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-card)',
            },
          },
        }}
      >
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <p className="text-sm font-bold text-foreground">{user?.nombres} {user?.apellidoPaterno}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <MenuItem onClick={() => { onCloseMenu(); onProfileClick(); }} sx={{ py: 1.5 }}>
          <UserCircle size={20} style={{ marginRight: 6 }} />
          <span className="text-sm font-medium text-foreground">Mi perfil</span>
        </MenuItem>
        <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'var(--color-red-600)' }}>
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
        'flex items-center h-14 md:h-16 border-b border-[var(--color-border)] shrink-0 transition-all duration-300',
        collapsed ? 'justify-center px-0' : 'justify-start px-5'
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-unt-blue)] text-white border-2 border-primary-400 font-extrabold text-sm overflow-hidden dark:bg-[var(--color-unt-blue-light)]">
          <span className="relative z-10">SG</span>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-[var(--color-unt-blue)] dark:text-primary-300 leading-tight truncate">SGPP UNT</p>
            <p className="text-xs text-muted-foreground font-medium truncate">Ing. Industrial</p>
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
    <div className="flex flex-col h-full bg-[var(--color-card)]">
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
  onSearchOpen,
}: {
  currentPage: string;
  onMenuClick: () => void;
  onSearchOpen: () => void;
}) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[1200] flex items-center bg-[var(--color-card)]/90 backdrop-blur-md border-b-2 border-primary-600 shadow-sm transition-all duration-300"
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
        <h1 className="flex-1 text-sm sm:text-base font-bold text-[var(--color-unt-blue)] dark:text-primary-300 truncate">
          {currentPage}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onSearchOpen}
            className="hidden sm:flex items-center gap-2 h-9 rounded-xl border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search size={16} />
            <span className="text-xs">Buscar...</span>
            <kbd className="ml-1 inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
              {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl+'}K
            </kbd>
          </button>
          <ThemeToggle />
          <NotificationsMenu />
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useKeyboardShortcuts();

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
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Top Bar - Full width, fixed at top */}
      <TopBar
        currentPage={currentPage}
        onMenuClick={handleDrawerToggle}
        onSearchOpen={() => setCommandPaletteOpen(true)}
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
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 bg-[var(--color-background)]"
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

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
