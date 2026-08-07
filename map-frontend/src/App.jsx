// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login'; 
import Dashboard from './views/Dashboard'; // Importa tu nuevo componente modular
import DetalleProyecto from './views/DetalleProyecto'; // 👈 Importar

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el Login en la raíz */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta para tu nuevo Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/proyectos/:id" element={<DetalleProyecto />} /> {/* 👈 Agregar detalle de proyecto */}
        
        {/* Redirección automática al Login si ingresan cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;