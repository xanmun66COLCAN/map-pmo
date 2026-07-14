import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './views/Login'; 

// 1️⃣ TU COMPONENTE TEMPORAL (El que acabas de validar, impecable)
function DashboardTemporal() {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ Sin token activo. Redirigiendo al Login...");
      navigate('/');
      return;
    }

    const cargarProyectos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        // 🔍 IMPRIMIR RESPUESTA: Abre la consola del navegador para ver esto
        console.log("📡 Datos crudos que llegaron del backend:", data);

        // En src/App.jsx, dentro de cargarProyectos, reemplaza las validaciones por esto:

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Error al obtener proyectos del servidor');
        }

        // 🛡️ Ajuste definitivo para extraer el Array de tu API
        if (Array.isArray(data)) {
          setProyectos(data);
        } else if (data && Array.isArray(data.data)) {
          // ⚡ ¡Aquí está el truco! Capturamos el Array(5) que viene en data.data
          setProyectos(data.data);
        } else if (data && Array.isArray(data.proyectos)) {
          setProyectos(data.proyectos);
        } else {
          console.warn("⚠️ La respuesta del API no es un arreglo válido:", data);
          setProyectos([]);
        }

      } catch (err) {
        console.error("❌ Falló la carga protegida:", err.message);
        setError(err.message);
        
        if (err.message.includes("Token") || err.message.includes("expirado") || err.message.includes("inválido")) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Encabezado Principal */}
        <div className="flex justify-between items-center mb-8 border-b border-[#2D2845] pb-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#22C55E]">
              🚀 MAP PMO - DASHBOARD
            </h1>
            {usuario && (
              <p className="text-[#94A3B8] text-sm mt-1">
                Bienvenido de vuelta, <span className="text-[#A855F7] font-bold">{usuario.nombre}</span> 
                (Rol ID: <span className="text-[#22C55E] font-bold">{usuario.id_role || usuario.id_rol}</span>)
              </p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs bg-[#EF4444]/20 border border-[#EF4444]/40 hover:bg-[#EF4444] text-white px-4 py-2 rounded-lg transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Renderizado de Proyectos */}
        {loading ? (
          <p className="text-sm text-[#94A3B8] animate-pulse text-center mt-10">
            Consultando iniciativas en el servidor Postgres...
          </p>
        ) : !Array.isArray(proyectos) || proyectos.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center mt-10">
            No hay iniciativas registradas en el PMO actualmente.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proyectos.map((proyecto) => (
              <div 
                key={proyecto.id} 
                className="bg-[#13111C] border border-[#2D2845] rounded-xl p-5 shadow-lg hover:border-[#22C55E]/50 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-white mb-2">{proyecto.nombre}</h3>
                <p className="text-xs text-[#94A3B8] line-clamp-3 mb-4">{proyecto.descripcion || 'Sin descripción.'}</p>
                <div className="flex justify-between items-center text-[10px] uppercase font-semibold tracking-wider text-[#A855F7]">
                  <span>Código: {proyecto.codigo || 'N/A'}</span>
                  <span className="text-[#22C55E]">Gobernanza Activa</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// 2️⃣ EL ENRUTADOR PRINCIPAL (Que se exporta por defecto al final)
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardTemporal />} />
      </Routes>
    </Router>
  );
}

export default App;