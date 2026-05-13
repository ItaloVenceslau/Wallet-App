import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      // Verificar token (opcional: decodificar JWT)
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      authService.setToken(data.token);
      setUser({ email });
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro no login');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register({ name, email, password });
      authService.setToken(data.token);
      setUser({ email, name });
      toast.success('Conta criada com sucesso!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro no cadastro');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logout realizado');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};