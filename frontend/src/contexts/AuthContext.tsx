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

  const checkAuth = async (passedToken?: string) => {
    const token = passedToken || localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Enviando petición a /auth/user con token:", token.substring(0, 10) + "...");
      
      const response = await axios.get('https://logros-backend.onrender.com/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.user) {
        console.log("✅ Usuario validado:", response.data.user.username);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("❌ Error en la validación:", error);
      // Solo limpiamos si el error es de autenticación
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');

      if (tokenFromUrl) {
        console.log("📍 Token detectado en URL, guardando...");
        localStorage.setItem('token', tokenFromUrl);
        
        // Limpiamos la URL inmediatamente
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Forzamos que checkAuth use el token que acabamos de recibir
        await checkAuth(tokenFromUrl);
      } else {
        // Si no hay token en la URL, buscamos el de siempre
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          await checkAuth(savedToken);
        } else {
          setLoading(false);
        }
      }
    };

    initializeAuth();
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