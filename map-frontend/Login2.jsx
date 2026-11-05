import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  // 1. Creamos los estados para capturar lo que el usuario escribe
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // El "navigate" es la herramienta de React Router para cambiar de página sin recargar
  const navigate = useNavigate();

  // 2. Función que se ejecuta cuando el usuario presiona el botón de "Ingresar"
  const manejarSubmit = async (e) => {
    e.preventDefault(); // Evita que la página web se recargue por defecto
    setError('');
    setCargando(true);

    try {
      // Hacemos la petición a tu backend en el puerto 5000
      const respuesta = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // Si el backend responde con un error (ej: 401 credenciales incorrectas), lo atrapamos
        throw new Error(datos.error || 'Ocurrió un error al iniciar sesión.');
      }

      // ==========================================
      // ¡AQUÍ GUARDAMOS EL TOKEN (OPCIÓN A)!
      // ==========================================
      // Guardamos el token string en el localStorage del navegador
      localStorage.setItem('token', datos.token);

      // Como los datos del usuario vienen en un objeto, los convertimos a texto antes de guardar
      localStorage.setItem('usuario', JSON.stringify(datos.usuario));

      console.log('Autenticación exitosa. Token guardado.');

      // 3. REDIRECCIÓN AUTOMÁTICA
      // Redireccionamos al usuario a la ruta principal del sistema de MAP PMO
      navigate('/dashboard'); 

    } catch (err) {
      // Si algo falla, guardamos el mensaje de error para mostrártelo en pantalla al usuario
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0b0e', color: '#fff', minHeight: '100vh', padding: '40px' }}>
      <h2>Iniciar Sesión - MAP PMO</h2>
      
      <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '15px' }}>
        <div>
          <label>Correo Electrónico:</label>
          <input 
            type="email" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', background: '#1a1a24', color: '#fff', border: '1px solid #444' }}
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={contrasena} 
            onChange={(e) => setContrasena(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', background: '#1a1a24', color: '#fff', border: '1px solid #444' }}
          />
        </div>

        {error && <p style={{ color: '#ff5555', fontSize: '14px' }}>{error}</p>}

        <button 
          type="submit" 
          disabled={cargando}
          style={{ padding: '10px', background: '#7b2cbf', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;