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
    const storedToken = localStorage.getItem('token');
    console.log('🔍 CHECK AUTH - Token in localStorage:', storedToken ? 'YES' : 'NO');
    if (storedToken) {
      console.log('📡 Calling /auth/user...');
      try {
        const response = await axios.get('/auth/user');
        console.log('✅ Auth user response:', response.data);
        setUser(response.data);
      } catch (error) {
        console.log('❌ Auth check failed:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('🚫 No token in localStorage');
    }
    setLoading(false);
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