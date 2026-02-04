/**
 * Modelo para la configuración dinámica del Home
 * FASE 0.5 - Hero ✅
 * FASE 1 - Sección Cursos
 */

// ===== HERO/MASTHEAD =====
export interface HeroConfig {
  subtitulo1: string; // "¡Desarrolla tu fe!"
  subtitulo2: string; // Horario de clases
  titulo: string; // "ESCUELA BÍBLICA CAVEVID"
  botonTexto: string; // "Ver cursos"
  botonLink: string; // "#services"
  imagenFondo?: string; // Opcional - override CSS
}

// ===== SECCIÓN CURSOS =====
export interface MateriaInfo {
  nombre: string;
  estado?: 'en-curso' | 'proximamente' | 'completado' | null; // Badge opcional
}

export interface CursoInfo {
  titulo: string; // "Básico" o "Avanzado"
  subtitulo: string; // "Estudio Bíblico Fundamental"
  icono: string; // Clase de Font Awesome, ej: "fa-book-reader"
  descripcion: string;
  materias: MateriaInfo[];
}

export interface SeccionCursosConfig {
  visible: boolean;
  titulo: string; // "Cursos"
  subtitulo: string; // "Dos niveles para elegir."
  cursos: CursoInfo[]; // Normalmente 2: Básico y Avanzado
}

// ===== CONFIGURACIÓN PRINCIPAL =====
export interface ConfiguracionHome {
  id: 'principal';

  // Metadata
  ultimaActualizacion: Date;
  actualizadoPor: string; // ID del admin que hizo el último cambio

  // Hero/Masthead
  hero: HeroConfig;

  // Sección Cursos (FASE 1)
  seccionCursos?: SeccionCursosConfig;

  // TODO: Agregar resto de secciones en fases posteriores
  // seccionMaterias?: SeccionMateriasConfig;
  // seccionProposito?: SeccionPropositoConfig;
  // seccionProfesores?: SeccionProfesoresConfig;
  // seccionInscripcion?: SeccionInscripcionConfig;
  // footer?: FooterConfig;
}

// ===== CONFIGURACIÓN POR DEFECTO (Valores actuales del index.html) =====
export const CONFIG_HOME_DEFAULT: Omit<ConfiguracionHome, 'ultimaActualizacion' | 'actualizadoPor'> = {
  id: 'principal',

  hero: {
    subtitulo1: '¡Desarrolla tu fe!',
    subtitulo2: 'CLASES TODOS LOS DOMINGOS A LAS 18:00PM',
    titulo: 'ESCUELA BÍBLICA CAVEVID',
    botonTexto: 'Ver cursos',
    botonLink: '#services'
  },

  seccionCursos: {
    visible: true,
    titulo: 'Cursos',
    subtitulo: 'Dos niveles para elegir.',
    cursos: [
      {
        titulo: 'Básico',
        subtitulo: 'Estudio Bíblico Fundamental',
        icono: 'fa-book-reader',
        descripcion: 'Este curso introduce los principios básicos del estudio de la Biblia. Ideal para quienes desean establecer una base sólida en su camino de fe y servicio cristiano.',
        materias: [
          { nombre: 'Evangelismo Personal', estado: 'en-curso' },
          { nombre: 'Vida Cristiana', estado: null },
          { nombre: 'Síntesis del Antiguo Testamento', estado: null },
          { nombre: 'Síntesis del Nuevo Testamento', estado: null },
          { nombre: 'Servicio Ministerial', estado: null }
        ]
      },
      {
        titulo: 'Avanzado',
        subtitulo: 'Teología y Evangelismo Profesional',
        icono: 'fa-graduation-cap',
        descripcion: 'Este curso profundiza en el estudio avanzado de la Biblia y la teología cristiana. Está diseñado para aquellos que buscan un conocimiento más profundo para ejercer un liderazgo efectivo en la iglesia y en la misión cristiana.',
        materias: [
          { nombre: 'Métodos de Evangelismo General', estado: 'en-curso' },
          { nombre: 'Introducción a la Teología Sistemática', estado: null },
          { nombre: 'Bibliología', estado: null },
          { nombre: 'Homilética', estado: null },
          { nombre: 'Misiología', estado: null }
        ]
      }
    ]
  }
};
