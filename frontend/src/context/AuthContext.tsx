import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// User type
export type User = {
  id: number;
  name?: string;
  username?: string;
  email: string;
  avatarUrl?: string;
};

// Auth context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to get token
  const getToken = () => localStorage.getItem('token');

  // Always set axios default Authorization header if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    console.log('[AuthContext] Initial token check:', !!token);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => {
          console.log('[AuthContext] /api/auth/me response:', res.data);
          if (res.data && res.data.success && res.data.user) {
            const userData = {
              id: res.data.user.id,
              name: res.data.user.username || res.data.user.name,
              username: res.data.user.username,
              email: res.data.user.email,
              avatarUrl: res.data.user.avatarUrl || undefined,
            };
            console.log('[AuthContext] Setting user:', userData);
            setUser(userData);
          } else {
            console.log('[AuthContext] No valid user data, clearing');
            setUser(null);
            localStorage.removeItem('token');
          }
        })
        .catch((err) => {
          console.error('[AuthContext] /api/auth/me error:', err);
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => {
          console.log('[AuthContext] Loading finished');
          setLoading(false);
        });
    } else {
      console.log('[AuthContext] No token found');
      setLoading(false);
    }
  }, []);

  // Login with backend
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('[AuthContext] login response:', res.data);
      if (res.data && res.data.success && res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser({
          id: res.data.user.id,
          name: res.data.user.username || res.data.user.name,
          username: res.data.user.username,
          email: res.data.user.email,
          avatarUrl: res.data.user.avatarUrl || undefined,
        });
        return { success: true };
      } else {
        return { success: false, message: res.data?.message || 'Login failed' };
      }
    } catch (err: any) {
      console.error('[AuthContext] login error:', err);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Only log when state changes
  useEffect(() => {
    console.log('[AuthContext] State changed:', { user, isAuthenticated: !!user, loading });
  }, [user, loading]);
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 