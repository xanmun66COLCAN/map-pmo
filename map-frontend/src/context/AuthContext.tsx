import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from '../types/proyecto.types';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  tieneRol: (rolesPermitidos: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Inicialización sincronizada con las llaves de Login.tsx
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<Usuario | null>(() => {
    const storedUser = localStorage.getItem('usuario');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (newToken: string, newUser: Usuario) => {
    setToken(newToken);
    setUser(newUser);

    // Mismo nombre de llaves que en Login.tsx
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(newUser));

    const rol = (newUser as any).rol || (newUser as any).id_rol || 'SOLICITANTE';
    localStorage.setItem('user_role', String(rol));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('user_role');
  };

  // Helper para consultar permisos rápidamente desde cualquier vista
  const tieneRol = (rolesPermitidos: string[]): boolean => {
    if (!user) return false;
    const rolActual = (user as any).rol || (user as any).id_rol || '';
    return rolesPermitidos.includes(String(rolActual));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        tieneRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};