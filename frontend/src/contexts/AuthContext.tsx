import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  username: string;
  twitchId: string;
  currentPoints: number;
}A

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

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/user', { withCredentials: true });
        console.log('Auth user response:', response.data);
        setUser(response.data);
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = () => {
    window.location.href = `${axios.defaults.baseURL}/auth/twitch`;
  };

  const logout = () => {
    window.location.href = `${axios.defaults.baseURL}/auth/logout`;
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