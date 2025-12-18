import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';

interface User {
  id: string;
  username: string;
  twitchId: string;
  currentPoints: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Función para verificar el token con el servidor
  const checkAuth = async (tokenToUse?: string) => {
    const token = tokenToUse || localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Enviando validación al backend...");
      const response = await api.get('/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Validamos que la estructura sea response.data.user
      if (response.data && response.data.user) {
        console.log("✅ Usuario recuperado:", response.data.user.username);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("❌ Error en checkAuth:", error);
      // Solo limpiamos si el error es de token inválido (401)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Efecto de inicialización único
  useEffect(() => {
    const init = async () => {
      console.log("Checking URL for tokens...");
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');

      if (tokenFromUrl) {
        console.log("📍 Token encontrado en URL, guardando y validando...");
        localStorage.setItem('token', tokenFromUrl);
        // Limpiamos la URL sin recargar la página
        window.history.replaceState({}, document.title, window.location.pathname);
        // IMPORTANTE: Pasamos el token directamente para evitar retrasos de localStorage
        await checkAuth(tokenFromUrl);
      } else {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          await checkAuth(savedToken);
        } else {
          setLoading(false);
        }
      }
    };

    init();
  }, []);

  const login = () => {
    window.location.href = `${api.defaults.baseURL}/auth/twitch`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};