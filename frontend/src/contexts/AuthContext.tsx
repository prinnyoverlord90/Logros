import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://logros-backend.onrender.com';

// Add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  id: string;
  username: string;
  twitchId: string;
  currentPoints: number;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    // LOG DE CONTROL: Mira la consola del navegador, si sale "null", no estamos guardando bien el token
    console.log("🔍 Intentando checkAuth con token:", token);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://logros-backend.onrender.com/auth/user', {
        headers: {
          // Asegúrate de que Authorization esté escrito exactamente así
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("✅ Usuario recibido:", response.data);

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      // Solo borramos el token si el error es realmente de credenciales (401 o 403)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 URL SEARCH:', window.location.search); // DEBUG
    
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      console.log('💾 TOKEN DETECTADO, guardando...');
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', window.location.pathname);
      checkAuth();
    } else {
      checkAuth();
    }
  }, []);

  const login = () => {
    window.location.href = `${axios.defaults.baseURL}/auth/twitch`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};