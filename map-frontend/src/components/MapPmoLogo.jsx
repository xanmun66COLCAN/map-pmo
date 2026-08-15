import React from 'react';

export const MapPmoLogo = ({ className = "w-8 h-8", showText = true }) => {
  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Íconos / Gráfico SVG del Logo */}
      <svg 
        className={`${className} transition-transform duration-300 group-hover:scale-105`} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo de tarjeta tech con borde violeta sutil */}
        <rect width="40" height="40" rx="10" fill="#1A1726" stroke="#8B5CF6" strokeWidth="1.5" />
        
        {/* Nodo piramidal / Estructura de Proyectos (MAP) */}
        <path d="M12 28L20 12L28 28H12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Puntos de conexión (Nodos de red PMO) */}
        <circle cx="20" cy="12" r="3" fill="#10B981" />
        <circle cx="12" cy="28" r="2.5" fill="#8B5CF6" />
        <circle cx="28" cy="28" r="2.5" fill="#8B5CF6" />
        
        {/* Conector central */}
        <path d="M20 15V24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Texto de la marca (opcional, si quieres que muestre el nombre al lado) */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-wider text-base leading-none">
            MAP<span className="text-purple-400 font-extrabold ml-1">PMO</span>
          </span>
          <span className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">
            Management Office
          </span>
        </div>
      )}
    </div>
  );
};

export default MapPmoLogo;