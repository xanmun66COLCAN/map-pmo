import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './views/Login'; 

// Componente temporal para el Dashboard Cyberpunk corregido
function DashboardTemporal() {
  // 1. Obtenemos el texto del usuario
  const usuarioString = localStorage.getItem('usuario');
  
  // 2. Si existe, lo transformamos en objeto; si no, dejamos un objeto vacío para evitar errores
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#22C55E] mb-4">
        🚀 MAP PMO - DASHBOARD
      </h1>
      {usuario ? (
        <p className="text-[#94A3B8] text-lg">
          ¡Redirección exitosa! Bienvenido, <span className="text-[#A855F7] font-bold">{usuario.nombre}</span>. 
          Has ingresado con el <span className="text-[#22C55E] font-bold">Rol ID: {usuario.id_role || usuario.id_rol}</span>
        </p>
      ) : (
        <p className="text-[#EF4444] text-lg font-bold">⚠️ No has iniciado sesión correctamente.</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Muestra el Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta del Dashboard: A donde saltará tras el éxito */}
        <Route path="/dashboard" element={<DashboardTemporal />} />
      </Routes>
    </Router>
  );
}