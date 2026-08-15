import React from 'react';
import logoMapPmo from "../assets/logo-map-pmo.png";

const LogoMarca = ({ className = "", conTexto = true }) => {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Contenedor sin bordes, solo el logo 50% más grande y su brillo */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Halo de luz neón de fondo ajustado al nuevo tamaño */}
        <div className="absolute inset-0 bg-[#A855F7]/35 blur-xl rounded-full pointer-events-none -z-10"></div>
        
        {/* Logo ampliado 50% (w-20 h-20) */}
        <img 
          src={logoMapPmo} 
          alt="MAP PMO Logo" 
          className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Texto de la marca escalado de manera proporcional */}
      {conTexto && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-[#A855F7] text-2xl leading-tight drop-shadow-sm">
            MAP <span className="text-[#A855F7]">PMO</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Project Management
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoMarca;