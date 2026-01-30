export interface Leccion {
  id: string;
  seccionId: string;
  titulo: string;
  tipo: 'texto' | 'imagen' | 'pdf' | 'video';
  contenido: string;
  urlArchivo?: string;
  urlYoutube?: string;
  orden: number;
  tareas: string[]; // IDs de tareas asociadas a esta lección
  fechaCreacion: Date;
  // Progreso del estudiante (solo en runtime, no se guarda en BD de lecciones)
  completada?: boolean;
  fechaCompletado?: Date;
}
