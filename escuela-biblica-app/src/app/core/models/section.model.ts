export interface Seccion {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  orden: number;
  desbloqueoProgresivo: boolean;
  prerequisitos?: string[]; // IDs de secciones previas
  elementos: ElementoSeccion[]; // Lecciones, tareas, exámenes
}

export interface ElementoSeccion {
  id: string;
  tipo: 'leccion' | 'tarea' | 'examen';
  orden: number;
}
