export interface ConfiguracionCalificacion {
  id?: string;
  cursoId: string;
  ponderacionTareas: number; // Porcentaje (0-100)
  ponderacionExamenes: number; // Porcentaje (0-100)
  ponderacionAsistencia?: number; // Porcentaje (0-100), default: 0
  notaMinima: number; // Nota mínima de aprobación (0-100)
  escalaCalificacion: EscalaCalificacion;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

export interface EscalaCalificacion {
  aprobado: number; // >= esta nota
  desaprobado: number; // < esta nota
  excelente?: number; // >= esta nota
  bueno?: number; // >= esta nota
  regular?: number; // >= esta nota
}

export interface CalificacionEstudiante {
  id?: string;
  estudianteId: string;
  cursoId: string;
  calificaciones: DetalleCalificacion[];
  promedioTareas: number;
  promedioExamenes: number;
  calificacionFinal: number;
  estado: 'aprobado' | 'desaprobado' | 'en_progreso';
  fechaActualizacion?: Date;
}

export interface DetalleCalificacion {
  tipo: 'tarea' | 'examen';
  elementoId: string;
  titulo: string;
  calificacion: number;
  puntosObtenidos: number;
  puntosTotales: number;
  fecha: Date;
}

export interface ProgresoEstudiante {
  id?: string;
  estudianteId: string;
  cursoId: string;
  porcentajeAvance: number;
  leccionesCompletadas: string[];
  leccionesTotales: number;
  tareasEntregadas: string[];
  tareasTotales: number;
  examenesRealizados: string[];
  examenesTotales: number;
  calificacionActual: number;
  ultimaActividad: Date;
}

export interface EstadisticaCurso {
  cursoId: string;
  totalEstudiantes: number;
  estudiantesAprobados: number;
  estudiantesDesaprobados: number;
  estudiantesEnProgreso: number;
  promedioGeneral: number;
  tasaAprobacion: number;
  distribucionNotas: DistribucionNotas;
}

export interface DistribucionNotas {
  excelente: number; // cantidad
  bueno: number;
  regular: number;
  desaprobado: number;
}

export interface LibroCalificaciones {
  cursoId: string;
  cursoTitulo: string;
  estudiantes: FilaLibroCalificaciones[];
  configuracion: ConfiguracionCalificacion;
  columnas: ColumnaCalificacion[];
}

export interface FilaLibroCalificaciones {
  estudianteId: string;
  nombreEstudiante: string;
  email: string;
  tareas: { [tareaId: string]: number | null };
  examenes: { [examenId: string]: number | null };
  promedioTareas: number;
  promedioExamenes: number;
  promedioAsistencia?: number; // Promedio de asistencia (0-100)
  totalAsistencias?: number; // Total de registros de asistencia
  calificacionFinal: number;
  estado: 'aprobado' | 'desaprobado' | 'en_progreso';
}

export interface ColumnaCalificacion {
  id: string;
  tipo: 'tarea' | 'examen';
  titulo: string;
  puntosMaximos: number;
  orden: number;
}
