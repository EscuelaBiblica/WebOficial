export interface ConfiguracionCalificacion {
  cursoId: string;
  elementos: ElementoCalificacion[];
}

export interface ElementoCalificacion {
  id: string;
  tipo: 'tarea' | 'examen';
  nombre: string;
  ponderacion: number; // %
}
