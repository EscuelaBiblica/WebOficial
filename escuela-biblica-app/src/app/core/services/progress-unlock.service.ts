import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Seccion, ProgresoSeccion } from '../models/section.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressUnlockService {

  constructor(private firestore: Firestore) {}

  /**
   * Verifica si una sección está desbloqueada para un estudiante
   */
  async isSeccionUnlocked(seccionId: string, estudianteId: string, todasSecciones: Seccion[]): Promise<boolean> {
    const seccion = todasSecciones.find(s => s.id === seccionId);
    if (!seccion) return false;

    // Si no tiene desbloqueo progresivo, está siempre desbloqueada
    if (!seccion.desbloqueoProgresivo) return true;

    // Si no tiene prerrequisitos, está desbloqueada
    if (!seccion.prerequisitos || seccion.prerequisitos.length === 0) return true;

    // Verificar cada sección prerrequisito
    for (const prereqId of seccion.prerequisitos) {
      const cumpleRequisito = await this.verificarPrerrequisito(
        prereqId,
        estudianteId,
        todasSecciones
      );

      if (!cumpleRequisito) {
        return false; // Si falla uno, la sección está bloqueada
      }
    }

    return true; // Todos los requisitos cumplidos
  }

  /**
   * Verifica si se cumple un prerrequisito específico
   */
  private async verificarPrerrequisito(
    seccionPrereqId: string,
    estudianteId: string,
    todasSecciones: Seccion[]
  ): Promise<boolean> {
    const seccionPrereq = todasSecciones.find(s => s.id === seccionPrereqId);
    if (!seccionPrereq) return false;

    const progreso = await this.calcularProgresoSeccion(seccionPrereqId, estudianteId);

    // Si requiere completar todo, debe tener 100%
    if (seccionPrereq.requiereCompletarTodo) {
      return progreso.porcentajeCompletado >= 100;
    }

    // Si tiene porcentaje mínimo, verificarlo
    if (seccionPrereq.porcentajeMinimo !== undefined) {
      return progreso.porcentajeCompletado >= seccionPrereq.porcentajeMinimo;
    }

    // Por defecto, requiere al menos 70%
    return progreso.porcentajeCompletado >= 70;
  }

  /**
   * Calcula el progreso de un estudiante en una sección
   * AHORA CON GUARDADO EN BD
   */
  async calcularProgresoSeccion(seccionId: string, estudianteId: string): Promise<ProgresoSeccion> {
    try {
      console.log('🔍 [PROGRESO] Iniciando cálculo para:', { seccionId, estudianteId });

      // Validar que estudianteId no sea undefined o null
      if (!estudianteId) {
        console.error('❌ [PROGRESO] estudianteId es undefined o null');
        throw new Error('estudianteId es requerido para calcular progreso');
      }

      // Primero, intentar leer el progreso guardado
      const progresoDocId = `${estudianteId}_${seccionId}`;
      const progresoDocRef = doc(this.firestore, 'progreso', progresoDocId);

      console.log('📖 [PROGRESO] Intentando leer documento de progreso:', progresoDocId);
      const progresoDoc = await getDoc(progresoDocRef);
      console.log('✅ [PROGRESO] Documento leído exitosamente');

      // Si existe y es reciente (menos de 5 minutos), usarlo
      if (progresoDoc.exists()) {
        const data = progresoDoc.data() as any;
        const ultimaActualizacion = data.ultimaActualizacion?.toDate() || new Date(0);
        const tiempoTranscurrido = Date.now() - ultimaActualizacion.getTime();
        const CINCO_MINUTOS = 5 * 60 * 1000;

        if (tiempoTranscurrido < CINCO_MINUTOS) {
          console.log('✅ [PROGRESO] Usando datos en caché (menos de 5 minutos)');
          // Usar datos en caché
          return {
            seccionId: data.seccionId,
            estudianteId: data.estudianteId,
            leccionesCompletadas: data.leccionesCompletadas || [],
            tareasEntregadas: data.tareasEntregadas || [],
            examenesRealizados: data.examenesRealizados || [],
            porcentajeCompletado: data.porcentajeCompletado,
            bloqueada: data.bloqueada,
            cumpleRequisitos: data.cumpleRequisitos
          };
        }
      }

      console.log('🔄 [PROGRESO] Caché expirado o no existe, calculando desde cero...');

      // Si no existe o está desactualizado, calcular de nuevo
      // Obtener la sección
      console.log('📖 [PROGRESO] Leyendo sección:', seccionId);
      const seccionDoc = await getDoc(doc(this.firestore, 'secciones', seccionId));
      if (!seccionDoc.exists()) {
        console.error('❌ [PROGRESO] Sección no encontrada');
        throw new Error('Sección no encontrada');
      }
      console.log('✅ [PROGRESO] Sección leída exitosamente');

      const seccion = { id: seccionDoc.id, ...seccionDoc.data() } as Seccion;

      // Contar elementos totales
      const totalElementos = seccion.elementos.length;
      console.log('📊 [PROGRESO] Total elementos en sección:', totalElementos);

      if (totalElementos === 0) {
        const progresoCompleto = {
          seccionId,
          estudianteId,
          leccionesCompletadas: [],
          tareasEntregadas: [],
          examenesRealizados: [],
          porcentajeCompletado: 100,
          bloqueada: false,
          cumpleRequisitos: true
        };

        console.log('💾 [PROGRESO] Guardando progreso (sección vacía)...');
        // Guardar en BD
        await this.guardarProgreso(progresoCompleto);
        return progresoCompleto;
      }

      // Obtener lecciones completadas (asumimos que ver una lección = completarla)
      const leccionesCompletadas: string[] = [];
      // TODO: Implementar tracking de lecciones vistas

      // Obtener tareas entregadas
      let tareasEntregadas: string[] = [];
      try {
        console.log('📋 [PROGRESO] Consultando calificaciones (tareas)...');
        const tareasQuery = query(
          collection(this.firestore, 'calificaciones'),
          where('estudianteId', '==', estudianteId),
          where('tipo', '==', 'tarea')
        );
        const tareasSnapshot = await getDocs(tareasQuery);
        console.log('✅ [PROGRESO] Calificaciones leídas:', tareasSnapshot.docs.length, 'documentos');
        tareasEntregadas = tareasSnapshot.docs
          .map(doc => (doc.data() as any).tareaId)
          .filter(tareaId => seccion.elementos.some(e => e.id === tareaId));
        console.log('✅ [PROGRESO] Tareas entregadas filtradas:', tareasEntregadas.length);
      } catch (error) {
        console.error('❌ [PROGRESO] Error obteniendo tareas entregadas:', error);
      }

      // Obtener exámenes realizados
      let examenesRealizados: string[] = [];
      try {
        console.log('📝 [PROGRESO] Consultando intentos (exámenes)...');
        const examenesQuery = query(
          collection(this.firestore, 'intentos'),
          where('estudianteId', '==', estudianteId),
          where('estado', '==', 'finalizado')
        );
        const examenesSnapshot = await getDocs(examenesQuery);
        console.log('✅ [PROGRESO] Intentos leídos:', examenesSnapshot.docs.length, 'documentos');
        examenesRealizados = examenesSnapshot.docs
          .map(doc => (doc.data() as any).examenId)
          .filter(examenId => seccion.elementos.some(e => e.id === examenId));
        console.log('✅ [PROGRESO] Exámenes finalizados filtrados:', examenesRealizados.length);
      } catch (error) {
        console.error('❌ [PROGRESO] Error obteniendo exámenes realizados:', error);
      }

      // Calcular elementos completados
      const elementosCompletados = new Set([
        ...leccionesCompletadas,
        ...tareasEntregadas,
        ...examenesRealizados
      ]).size;

      const porcentajeCompletado = Math.round((elementosCompletados / totalElementos) * 100);

      const progreso: ProgresoSeccion = {
        seccionId,
        estudianteId,
        leccionesCompletadas,
        tareasEntregadas,
        examenesRealizados,
        porcentajeCompletado,
        bloqueada: false,
        cumpleRequisitos: true
      };

      // Guardar progreso en BD
      await this.guardarProgreso(progreso);

      return progreso;

    } catch (error) {
      console.error('Error calculando progreso:', error);
      return {
        seccionId,
        estudianteId,
        leccionesCompletadas: [],
        tareasEntregadas: [],
        examenesRealizados: [],
        porcentajeCompletado: 0,
        bloqueada: true,
        cumpleRequisitos: false
      };
    }
  }

  /**
   * Obtiene el estado de todas las secciones de un curso para un estudiante
   */
  async getEstadoSeccionesCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<Map<string, ProgresoSeccion>> {
    // Obtener todas las secciones del curso
    const seccionesQuery = query(
      collection(this.firestore, 'secciones'),
      where('cursoId', '==', cursoId)
    );
    const seccionesSnapshot = await getDocs(seccionesQuery);
    const secciones = seccionesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Seccion[];

    // Ordenar por orden
    secciones.sort((a, b) => a.orden - b.orden);

    const estadoMap = new Map<string, ProgresoSeccion>();

    // Calcular progreso para cada sección
    for (const seccion of secciones) {
      const progreso = await this.calcularProgresoSeccion(seccion.id, estudianteId);

      // Verificar si está bloqueada
      const desbloqueada = await this.isSeccionUnlocked(seccion.id, estudianteId, secciones);
      progreso.bloqueada = !desbloqueada;
      progreso.cumpleRequisitos = desbloqueada;

      if (seccion.prerequisitos && seccion.prerequisitos.length > 0) {
        progreso.seccionesPrerrequisito = seccion.prerequisitos;
      }

      estadoMap.set(seccion.id, progreso);
    }

    return estadoMap;
  }

  /**
   * Verifica si un estudiante puede acceder a un elemento específico
   */
  async puedeAccederElemento(
    seccionId: string,
    elementoId: string,
    estudianteId: string,
    todasSecciones: Seccion[]
  ): Promise<{ permitido: boolean; mensaje?: string }> {
    const seccionDesbloqueada = await this.isSeccionUnlocked(seccionId, estudianteId, todasSecciones);

    if (!seccionDesbloqueada) {
      const seccion = todasSecciones.find(s => s.id === seccionId);
      const prerequisitosNombres: string[] = [];

      if (seccion?.prerequisitos) {
        for (const prereqId of seccion.prerequisitos) {
          const prereqSeccion = todasSecciones.find(s => s.id === prereqId);
          if (prereqSeccion) {
            prerequisitosNombres.push(prereqSeccion.titulo);
          }
        }
      }

      return {
        permitido: false,
        mensaje: `Debes completar las siguientes secciones primero: ${prerequisitosNombres.join(', ')}`
      };
    }

    return { permitido: true };
  }

  /**
   * Obtiene el mensaje de bloqueo para una sección
   */
  async getMensajeBloqueo(
    seccionId: string,
    estudianteId: string,
    todasSecciones: Seccion[]
  ): Promise<string> {
    const seccion = todasSecciones.find(s => s.id === seccionId);
    if (!seccion) return '';

    if (!seccion.prerequisitos || seccion.prerequisitos.length === 0) {
      return '';
    }

    const prerequisitosPendientes: string[] = [];

    for (const prereqId of seccion.prerequisitos) {
      const cumple = await this.verificarPrerrequisito(prereqId, estudianteId, todasSecciones);
      if (!cumple) {
        const prereqSeccion = todasSecciones.find(s => s.id === prereqId);
        if (prereqSeccion) {
          const progreso = await this.calcularProgresoSeccion(prereqId, estudianteId);
          const requerido = prereqSeccion.requiereCompletarTodo
            ? 100
            : (prereqSeccion.porcentajeMinimo || 70);

          prerequisitosPendientes.push(
            `"${prereqSeccion.titulo}" (${progreso.porcentajeCompletado}% de ${requerido}% requerido)`
          );
        }
      }
    }

    if (prerequisitosPendientes.length === 0) {
      return '';
    }

    return `Completa estas secciones para desbloquear:\n${prerequisitosPendientes.join('\n')}`;
  }

  /**
   * Guarda el progreso en Firestore
   * NUEVO MÉTODO
   */
  private async guardarProgreso(progreso: ProgresoSeccion): Promise<void> {
    try {
      const progresoDocId = `${progreso.estudianteId}_${progreso.seccionId}`;
      const progresoDocRef = doc(this.firestore, 'progreso', progresoDocId);

      await setDoc(progresoDocRef, {
        ...progreso,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date() // Solo se usa en el primer guardado
      }, { merge: true });

      console.log('✅ Progreso guardado:', progresoDocId);
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  }

  /**
   * Actualiza el progreso cuando el estudiante completa una actividad
   * NUEVO MÉTODO PÚBLICO - Llamar después de entregar tarea o completar examen
   */
  async actualizarProgresoEstudiante(
    seccionId: string,
    estudianteId: string
  ): Promise<void> {
    try {
      // Forzar recalculo eliminando el caché
      const progresoDocId = `${estudianteId}_${seccionId}`;
      const progresoDocRef = doc(this.firestore, 'progreso', progresoDocId);

      // Marcar como desactualizado poniendo fecha antigua
      await setDoc(progresoDocRef, {
        ultimaActualizacion: new Date(0)
      }, { merge: true });

      // Recalcular progreso (que lo guardará automáticamente)
      await this.calcularProgresoSeccion(seccionId, estudianteId);

      console.log('✅ Progreso actualizado para estudiante:', estudianteId);
    } catch (error) {
      console.error('Error actualizando progreso:', error);
    }
  }

  /**
   * Invalida el caché de progreso para todas las secciones de un curso
   * Útil cuando se modifica la estructura del curso
   */
  async invalidarCacheProgresoCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<void> {
    try {
      // Obtener todas las secciones del curso
      const seccionesQuery = query(
        collection(this.firestore, 'secciones'),
        where('cursoId', '==', cursoId)
      );
      const seccionesSnapshot = await getDocs(seccionesQuery);

      // Invalidar caché de cada sección
      const promises = seccionesSnapshot.docs.map(seccionDoc => {
        const progresoDocId = `${estudianteId}_${seccionDoc.id}`;
        const progresoDocRef = doc(this.firestore, 'progreso', progresoDocId);
        return setDoc(progresoDocRef, {
          ultimaActualizacion: new Date(0)
        }, { merge: true });
      });

      await Promise.all(promises);
      console.log('✅ Caché de progreso invalidado para curso:', cursoId);
    } catch (error) {
      console.error('Error invalidando caché:', error);
    }
  }
}
