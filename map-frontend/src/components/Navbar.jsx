// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, Shield } from 'lucide-react';

// Importa tu logo desde la carpeta assets
import logoMapPmo from '../assets/logo-map-pmo.png';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Estados para el menú de notificaciones
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, texto: "Hito 'Fase 1 - Requisitos' próximo a vencer.", tiempo: "Hace 5 min", leida: false },
    { id: 2, texto: "Nuevo proyecto asignado: 'Optimización de Procesos'.", tiempo: "Hace 2 horas", leida: false },
  ]);

  // Obtenemos los datos del usuario guardados en el login
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
  const nombreUsuario = usuarioLogueado.nombre || 'Usuario';
  
  // Validamos si el usuario actual es administrador (Rol 4)
const esAdmin = usuarioLogueado.rol === 'ADMINISTRADOR';
  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/');
  };

  const marcarComoLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#13111C] via-[#1a1326] to-[#111c16] backdrop-blur-md border-b-2 border-purple-500/40 shadow-[0_4px_25px_rgba(168,85,247,0.18)] px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO, TÍTULO Y ESLOGAN */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <img 
            src={logoMapPmo} 
            alt="MAP PMO Logo" 
            className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.6)] transition-all duration-300" 
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-wider text-white">
                MAP <span className="text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">PMO</span>
              </h1>
              
              {/* Indicador de Estado Activo */}
              <span 
                title="Database connected and online"
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium border cursor-help transition-all bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Database Live
              </span>
            </div>
            
            <p className="text-[10px] text-[#22C55E]/90 uppercase tracking-widest font-semibold italic mt-0.5">
              “From Ideas to Impact.”
            </p>
          </div>
        </div>

        {/* ACCIONES DE USUARIO Y UTILIDADES */}
        <div className="flex items-center gap-3">

          {/* ---> BOTÓN DE ADMINISTRACIÓN CONDICIONADO AL ROL <--- */}
          {esAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              title="Panel de Administración"
              className="p-2 text-gray-400 hover:text-white bg-[#0B0A0F]/80 border border-[#2D2845] hover:border-purple-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline text-xs font-medium text-purple-300">Admin</span>
            </button>
          )}
          
          {/* Campana de Notificaciones con Desplegable */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notificaciones"
              className="relative p-2 text-gray-400 hover:text-white bg-[#0B0A0F]/80 border border-[#2D2845] hover:border-purple-500/30 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4 text-purple-400" />
              {notificaciones.some(n => !n.leida) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full"></span>
              )}
            </button>

            {/* Panel Desplegable */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#13111C] border border-purple-500/40 rounded-xl shadow-2xl py-3 px-4 z-50">
                <div className="flex justify-between items-center mb-3 border-b border-purple-500/20 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Notificaciones</h3>
                  <button 
                    onClick={marcarComoLeidas}
                    className="text-[10px] text-purple-400 cursor-pointer hover:underline bg-transparent border-none"
                  >
                    Marcar leídas
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notificaciones.length > 0 ? (
                    notificaciones.map(n => (
                      <div key={n.id} className="p-2 bg-[#0B0A0F] rounded-lg border border-purple-500/10 text-xs text-gray-300">
                        <p>{n.texto}</p>
                        <span className="text-[9px] text-purple-400/70 mt-1 block">{n.tiempo}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No hay notificaciones nuevas</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta de Usuario */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 bg-[#0B0A0F]/80 border border-purple-500/30 px-3.5 py-2 rounded-lg shadow-[inset_0_0_10px_rgba(168,85,247,0.05)]">
            <User className="w-4 h-4 text-[#22C55E]" />
            <span>
              Welcome, <strong className="text-white">{nombreUsuario}</strong>
            </span>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button 
            onClick={handleCerrarSesion}
            title="Sign out"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-400 bg-[#0B0A0F]/80 border border-[#2D2845] hover:border-red-500/30 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;