export interface Tarea {
  id: string;
  leccionId: string; // Ahora las tareas pertenecen a lecciones
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tipoEntrega: 'texto' | 'archivo' | 'ambos';
  fechaInicio: Date;
  fechaFin: Date;
  ponderacion: number; // %
  archivosPermitidos?: string[]; // ['.pdf', '.docx', '.jpg']
  tamanoMaximo: number; // MB
  fechaCreacion: Date;
}

export interface EntregaTarea {
  id: string;
  tareaId: string;
  estudianteId: string;
  fechaEntrega: Date;
  contenidoTexto?: string;
  archivos?: string[]; // URLs
  calificacion?: number;
  retroalimentacion?: string;
  estado: 'pendiente' | 'entregada' | 'calificada' | 'retrasada';
}
