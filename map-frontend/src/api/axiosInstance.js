import axios from 'axios';

// Instancia centralizada apuntando al backend Express
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: adjunta el Token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      // Inyección segura de cabeceras para compatibilidad con Axios v1+
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: maneja timeouts y peticiones no autorizadas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('⏱️ Tiempo de espera agotado: El backend no respondió a tiempo.');
    }

    // Si el servidor devuelve 401 o 403 (No autorizado / Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('🔒 Sesión inválida o expirada. Limpiando tokens de autenticación...');

      // Limpieza de las llaves estandarizadas de sesión
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');

      // Ruta destino de login (ajusta a '/login' si no es la raíz)
      const LOGIN_ROUTE = '/'; 

      // Redirección condicional para prevenir bucle infinito
      if (window.location.pathname !== LOGIN_ROUTE) {
        window.location.href = LOGIN_ROUTE;
      }
    }

    return Promise.reject(error);
  }
);

export default api;