// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login'; 
import Dashboard from './views/Dashboard'; 
import DetalleProyecto from './views/DetalleProyecto'; 

function App() {
  return (
    <Routes>
      {/* Ruta para el Login en la raíz */}
      <Route path="/" element={<Login />} />
      
      {/* Ruta para tu Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Ruta para detalle de proyecto */}
      <Route path="/proyectos/:id" element={<DetalleProyecto />} />
      
      {/* Redirección automática al Login si ingresan cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;