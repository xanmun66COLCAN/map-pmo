import api from '../api/axiosInstance';
import { Proyecto, DashboardStatsData } from '../types/proyecto.types';

export const proyectoService = {
  // Obtener la lista completa de proyectos / iniciativas
  obtenerProyectos: async (): Promise<Proyecto[]> => {
    const response = await api.get<Proyecto[]>('/iniciativas');
    return response.data;
  },

  // Obtener estadísticas del Dashboard
  obtenerEstadisticas: async (): Promise<DashboardStatsData> => {
    const response = await api.get<DashboardStatsData>('/iniciativas/stats');
    return response.data;
  },

  // Crear proyecto
  crearProyecto: async (proyecto: Omit<Proyecto, 'id'>): Promise<Proyecto> => {
    const response = await api.post<Proyecto>('/iniciativas', proyecto);
    return response.data;
  },

  // Actualizar proyecto
  actualizarProyecto: async (id: string | number, proyecto: Partial<Proyecto>): Promise<Proyecto> => {
    const response = await api.put<Proyecto>(`/iniciativas/${id}`, proyecto);
    return response.data;
  },

  // Eliminar proyecto
  eliminarProyecto: async (id: string | number): Promise<void> => {
    await api.delete(`/iniciativas/${id}`);
  },
};