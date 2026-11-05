import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Ya no necesitamos isAuthenticated aquí para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const datosAEnviar = { correo: email, contrasena: password };
      console.log("🚀 Enviando credenciales al Backend vía Axios:", datosAEnviar);

      const response = await api.post('/auth/login', datosAEnviar);
      const data = response.data;

      console.log('✅ LOGIN EXITOSO:', data);

      const tokenAGuardar = data.token || data.accessToken || data.jwt;
      const usuarioAGuardar = data.usuario || data.user;

      if (!tokenAGuardar || !usuarioAGuardar) {
        throw new Error('La respuesta del servidor no incluyó un token o usuario válido.');
      }

      // Extraer el nombre del rol (ej: 'ADMINISTRADOR', 'LIDER_PMO')
      const rolEnTexto = usuarioAGuardar.rol || usuarioAGuardar.id_rol || 'SOLICITANTE';

      // 1. Guardar de forma sincrónica en localStorage para que Axios lo lea de inmediato
      localStorage.setItem('token', tokenAGuardar);
      localStorage.setItem('usuario', JSON.stringify(usuarioAGuardar));
      localStorage.setItem('user_role', String(rolEnTexto));

      // 2. Actualizar el estado en el AuthContext
      login(tokenAGuardar, usuarioAGuardar);

      // 3. Redirigir de forma segura al dashboard de manera inmediata
      console.log("🔒 Credenciales guardadas, redirigiendo a /dashboard...");
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('❌ Error en el flujo de autenticación:', err);
      const mensajeServer = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(mensajeServer || 'Error de conexión con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#13111C] border border-[#2D2845] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Efecto decorativo de fondo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Encabezado MAP PMO */}
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