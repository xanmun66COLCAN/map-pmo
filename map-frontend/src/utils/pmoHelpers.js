// src/utils/pmoHelpers.js

export const extraerLista = (responseDato) => {
  if (!responseDato) return [];
  if (Array.isArray(responseDato)) return responseDato;
  if (Array.isArray(responseDato.data)) return responseDato.data;
  if (Array.isArray(responseDato.proyectos)) return responseDato.proyectos;
  if (Array.isArray(responseDato.iniciativas)) return responseDato.iniciativas;
  return [];
};

export const manejarOrdenamiento = (lista, columna, direccion) => {
  if (!Array.isArray(lista) || lista.length === 0) return [];
  if (!columna) return lista;

  return [...lista].sort((a, b) => {
    let valA = '';
    let valB = '';

    if (columna === 'nombre') {
      valA = (a.nombre || a.titulo || a.name || '').toString().toLowerCase().trim();
      valB = (b.nombre || b.titulo || b.name || '').toString().toLowerCase().trim();
    } else if (columna === 'area') {
      valA = (a.area || a.departamento || a.solicitante?.area || a.solicitante?.departamento || '').toString().toLowerCase().trim();
      valB = (b.area || b.departamento || b.solicitante?.area || b.solicitante?.departamento || '').toString().toLowerCase().trim();
    } else if (columna === 'puntaje') {
      // Usamos -1 para los no calificados de modo que siempre queden al final
      valA = Number(a.puntaje_global !== undefined && a.puntaje_global !== null ? a.puntaje_global : -1);
      valB = Number(b.puntaje_global !== undefined && b.puntaje_global !== null ? b.puntaje_global : -1);
      return direccion === 'asc' ? valA - valB : valB - valA;
    } else if (columna === 'fecha') {
      valA = new Date(a.fecha_inicio || a.fecha_creacion || a.createdAt || 0).getTime();
      valB = new Date(b.fecha_inicio || b.fecha_creacion || b.createdAt || 0).getTime();
      return direccion === 'asc' ? valA - valB : valB - valA;
    } else if (columna === 'estado') {
      valA = (a.estado || 'Idea').toString().toLowerCase().trim();
      valB = (b.estado || 'Idea').toString().toLowerCase().trim();
    } else {
      return 0;
    }

    if (valA < valB) return direccion === 'asc' ? -1 : 1;
    if (valA > valB) return direccion === 'asc' ? 1 : -1;
    return 0;
  });
};