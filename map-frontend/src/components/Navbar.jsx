// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

// Importa tu logo desde la carpeta assets
import logoMapPmo from '../assets/logo-map-pmo.png';

const Navbar = () => {
  const navigate = useNavigate();

  // Obtenemos los datos del usuario guardados en el login
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
  const nombreUsuario = usuarioLogueado.nombre || 'Usuario';

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#13111C]/95 backdrop-blur-md border-b border-[#2D2845] px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO (50% más grande) Y TÍTULO DE LA APLICACIÓN */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center justify-center w-16 h-16 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/30 p-1">
            <img 
              src={logoMapPmo} 
              alt="MAP PMO Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">
              MAP <span className="text-[#A855F7]">PMO</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Project Management Office</p>
          </div>
        </div>

        {/* BIENVENIDA Y ACCIONES DE USUARIO */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 bg-[#0B0A0F] border border-[#2D2845] px-3.5 py-2 rounded-lg">
            <User className="w-4 h-4 text-[#A855F7]" />
            <span>
              Bienvenido, <strong className="text-white">{nombreUsuario}</strong>
            </span>
          </div>

          <button 
            onClick={handleCerrarSesion}
            title="Cerrar sesión"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-400 bg-[#0B0A0F] border border-[#2D2845] hover:border-red-500/30 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;