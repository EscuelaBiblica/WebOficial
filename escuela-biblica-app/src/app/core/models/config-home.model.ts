/**
 * Modelo para la configuración dinámica del Home
 * FASE 0.5 - Prueba de concepto con Hero
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

// ===== CONFIGURACIÓN PRINCIPAL (Versión inicial - solo Hero) =====
export interface ConfiguracionHome {
  id: 'principal';

  // Metadata
  ultimaActualizacion: Date;
  actualizadoPor: string; // ID del admin que hizo el último cambio

  // Hero/Masthead
  hero: HeroConfig;

  // TODO: Agregar resto de secciones en fases posteriores
  // seccionCursos?: SeccionCursosConfig;
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
  }
};
