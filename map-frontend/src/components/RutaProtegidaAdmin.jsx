// src/components/RutaProtegidaAdmin.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegidaAdmin = ({ children }) => {
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
  const esAdmin = usuarioLogueado.rol === 'ADMINISTRADOR';

  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RutaProtegidaAdmin;