const normalizeRoles = (roles = []) =>
  roles.map((r) => (typeof r === 'string' ? r : r.authority || r.nombre || '')).map((r) => r.replace(/^ROLE_/, ''));

export const hasAnyRole = (roles = [], expected = []) => {
  const normalized = normalizeRoles(roles);
  return expected.some((role) => normalized.includes(role));
};

/** Orden de prioridad para redirección post-login (roles más específicos primero). */
export const ROLE_HOME_PRIORITY = [
  ['ESTUDIANTE', '/estudiante/dashboard'],
  ['DOCENTE_ASESOR', '/docente/dashboard'],
  ['TUTOR_EXTERNO', '/tutor/dashboard'],
  ['COORDINADOR', '/coordinacion/dashboard'],
  ['DIRECTOR', '/coordinacion/dashboard'],
  ['COMITE_PRACTICAS', '/comite/panel'],
  ['SECRETARIA', '/admin/dashboard'],
  ['ADMIN_SISTEMA', '/admin/dashboard'],
  ['ADMINISTRADOR', '/admin/dashboard'],
];

export function getHomeRoute(roles = []) {
  for (const [role, path] of ROLE_HOME_PRIORITY) {
    if (hasAnyRole(roles, [role])) return path;
  }
  return '/login';
}

export function isCoordinacionRole(roles = []) {
  return hasAnyRole(roles, ['COORDINADOR', 'DIRECTOR']);
}

export function isAdminDashboardRole(roles = []) {
  return hasAnyRole(roles, ['ADMIN_SISTEMA', 'ADMINISTRADOR', 'SECRETARIA', 'COMITE_PRACTICAS']);
}
