import { useState } from 'react';
// 1️⃣ IMPORTACIÓN: Traemos el hook de redirección
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2️⃣ INICIALIZACIÓN: Activamos el enrutador
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const datosAEnviar = { correo: email, contrasena: password };
      
      console.log("🚀 Datos que están saliendo del Frontend:", datosAEnviar);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAEnviar),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // 🔍 INSPECCIÓN: Esto imprimirá en tu consola la estructura exacta del Backend
      console.log('🚀 OBJETO COMPLETO RECIBIDO DEL BACKEND:', data);

      // Buscamos el token de forma inteligente por si el backend usa otro nombre
      const tokenRecibido = data.token || data.accessToken || data.jwt || (data.usuario && data.usuario.token);
      
      console.log('Login Exitoso, Token procesado:', tokenRecibido);
      
      // Guardamos el token de seguridad si existe
      if (tokenRecibido) {
        localStorage.setItem('token', tokenRecibido);
      } else {
        console.warn("⚠️ ¡Atención! No se detectó ninguna propiedad de token común en la respuesta.");
      }

      // Guardamos el objeto completo 'usuario' para que App.jsx pueda leerlo sin problemas
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      } else if (data.user) {
        // Por si acaso el backend devuelve 'user' en vez de 'usuario'
        localStorage.setItem('usuario', JSON.stringify(data.user));
      }

      // Tu guardado de rol actual
      const usuarioActivo = data.usuario || data.user;
      if (usuarioActivo && usuarioActivo.id_rol) {
        localStorage.setItem('user_role', usuarioActivo.id_rol);
      }

      // 🛑 REVISIÓN TEMPORAL: Te mostrará una alerta en Ubuntu con el JSON exacto del backend
      alert("Datos que llegaron del backend: " + JSON.stringify(data));

      // 🚀 REDIRECCIÓN MÁGICA: Empujamos al usuario al dashboard automáticamente
      navigate('/dashboard');

    } catch (err) {
      console.error('Error en la conexión:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#13111C] border border-[#2D2845] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Efecto decorativo neón de fondo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl"></div>

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#22C55E]">
            MAP PMO
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            Ingresa al sistema de gobernanza y priorización
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Alerta de Error Dinámica */}
          {error && (
            <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] text-xs p-3 rounded-lg font-medium">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-4 py-3 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all"
              placeholder="alexander@empresa.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0A0F] border border-[#2D2845] rounded-lg px-4 py-3 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#22C55E] hover:to-[#16A34A] text-white font-semibold rounded-lg shadow-lg hover:shadow-[#22C55E]/20 transition-all duration-300 transform active:scale-[0.98] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}