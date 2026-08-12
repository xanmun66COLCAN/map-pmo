export type EstadoProyecto = 'PLANIFICACION' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';
export type PrioridadProyecto = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Proyecto {
  id: string | number;
  nombre: string;
  descripcion?: string;
  estado: EstadoProyecto;
  prioridad: PrioridadProyecto;
  presupuesto?: number;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStatsData {
  totalProyectos: number;
  enProgreso: number;
  completados: number;
  presupuestoTotal: number;
}

export interface Usuario {
  id: string | number;
  nombre?: string;
  correo: string;
  rol?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  usuario?: Usuario;
  user?: Usuario;
}