import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as apiLogin } from '../api/authService';

export interface UserRole {
  id?: number;
  authority?: string;
  nombre?: string;
}

export interface User {
  id?: number;
  username?: string;
  email?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  apellidos?: string;
  roles?: (string | UserRole)[];
  [key: string]: unknown;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | undefined>;
  updateUser: (user: User) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children?: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sgpp_token');
    const storedUser = localStorage.getItem('sgpp_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('sgpp_token');
        localStorage.removeItem('sgpp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User | undefined> => {
    setLoading(true);
    try {
      queryClient.clear();
      const { data } = await apiLogin(username, password);
      const { token: jwt, usuario }: { token: string; usuario: User } = data;
      localStorage.setItem('sgpp_token', jwt);
      localStorage.setItem('sgpp_user', JSON.stringify(usuario));
      setToken(jwt);
      setUser(usuario);
      return usuario;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    queryClient.clear();
    localStorage.removeItem('sgpp_token');
    localStorage.removeItem('sgpp_user');
    setToken(null);
    setUser(null);
  }, [queryClient]);

  const updateUser = useCallback((nextUser: User) => {
    localStorage.setItem('sgpp_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user?.roles) return false;
      return user.roles.some((userRole) => {
        const roleName = typeof userRole === 'string' ? userRole : userRole.authority || userRole.nombre;
        return roleName === role || roleName === `ROLE_${role}`;
      });
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, login, updateUser, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
