// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Login from './views/Login'; 
import Dashboard from './views/Dashboard'; 
import DetalleProyecto from './views/DetalleProyecto'; 
import ListaIniciativas from './views/ListaIniciativas';
import VistaAdministracion from './views/VistaAdministracion';
import RutaProtegidaAdmin from './components/RutaProtegidaAdmin'; // <--- 1. Importamos la ruta protegida

// Componente auxiliar para manejar el Navbar fijo y el espacio superior
const LayoutPrincipal = ({ children }) => {
  const location = useLocation();
  // Verificamos si estamos en la ruta de Login para no mostrar el Navbar
  const esLogin = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white flex flex-col">
      {!esLogin && <Navbar />}
      {/* Si no es el login, agregamos pt-20 para que el contenido no quede debajo del Navbar fijo */}
      <main className={`flex-1 ${!esLogin ? 'pt-20' : ''}`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <LayoutPrincipal>
      <Routes>
        {/* Ruta para el Login en la raíz */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta para tu Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ruta para el Portafolio de Iniciativas */}
        <Route path="/iniciativas" element={<ListaIniciativas />} /> 

        {/* Ruta para detalle de proyecto */}
        <Route path="/proyectos/:id" element={<DetalleProyecto />} />

        {/* Ruta para el Panel de Administración protegida por rol de Admin (1) */}
        <Route 
          path="/admin" 
          element={
            <RutaProtegidaAdmin>
              <VistaAdministracion />
            </RutaProtegidaAdmin>
          } 
        />
        
        {/* Redirección automática al Login si ingresan cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutPrincipal>
  );
}

export default App;