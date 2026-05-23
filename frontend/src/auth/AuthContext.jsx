import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sgpp_token');
    const storedUser = localStorage.getItem('sgpp_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await apiLogin(username, password);
    const { token: jwt, usuario } = data;
    localStorage.setItem('sgpp_token', jwt);
    localStorage.setItem('sgpp_user', JSON.stringify(usuario));
    setToken(jwt);
    setUser(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sgpp_token');
    localStorage.removeItem('sgpp_user');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((role) => user?.roles?.includes(role), [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
