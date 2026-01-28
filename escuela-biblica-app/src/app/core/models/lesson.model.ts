export interface Leccion {
  id: string;
  seccionId: string;
  titulo: string;
  tipo: 'texto' | 'imagen' | 'pdf' | 'video';
  contenido: string;
  urlArchivo?: string;
  urlYoutube?: string;
  orden: number;
  fechaCreacion: Date;
}
