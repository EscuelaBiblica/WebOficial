import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CourseService } from '../../core/services/course.service';
import { SectionService } from '../../core/services/section.service';
import { LessonService } from '../../core/services/lesson.service';
import { TaskService } from '../../core/services/task.service';
import { ExamService } from '../../core/services/exam.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso } from '../../core/models/course.model';
import { Seccion, ElementoSeccion } from '../../core/models/section.model';
import { Leccion } from '../../core/models/lesson.model';
import { Tarea, EntregaTarea } from '../../core/models/task.model';
import { Examen, IntentoExamen } from '../../core/models/exam.model';

interface SeccionExpandida extends Seccion {
  expanded: boolean;
  lecciones: LeccionConTareas[];
  examenesData: ExamenConIntentos[];
}

interface ExamenConIntentos extends Examen {
  intentosUsuario: IntentoExamen[];
  disponible: boolean;
  intentosRestantes: number;
}

interface LeccionConTareas extends Leccion {
  tareasData: Tarea[]; // Array completo de objetos Tarea (diferente de tareas: string[])
  expanded: boolean; // Para expandir/colapsar lista de tareas
}

@Component({
  selector: 'app-course-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-viewer.component.html',
  styleUrl: './course-viewer.component.scss'
})
export class CourseViewerComponent implements OnInit {
  curso: Curso | null = null;
  secciones: SeccionExpandida[] = [];
  currentUser: any = null;
  userRole: string = '';
  loading: boolean = true;
  sidebarOpen: boolean = false; // Para controlar menú en móviles

  // Contenido actual
  contenidoActual: {
    tipo: 'leccion' | 'tarea' | 'examen' | null;
    seccionTitulo: string;
    elemento: Leccion | Tarea | ExamenConIntentos | null;
    entrega?: EntregaTarea | null;
  } = {
    tipo: null,
    seccionTitulo: '',
    elemento: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sectionService: SectionService,
    private lessonService: LessonService,
    private taskService: TaskService,
    private examService: ExamService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const firebaseUser = this.authService.getCurrentUser();
    if (!firebaseUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener el perfil completo del usuario con el rol
    this.currentUser = await this.authService.getCurrentUserProfile();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userRole = this.currentUser.rol;

    const cursoId = this.route.snapshot.paramMap.get('cursoId');
    if (!cursoId) {
      alert('Curso no especificado');
      this.goBack();
      return;
    }

    await this.loadCurso(cursoId);
  }

  async loadCurso(cursoId: string) {
    this.loading = true;
    try {
      // Cargar curso
      this.curso = await this.courseService.getCourseById(cursoId);
      if (!this.curso) {
        alert('Curso no encontrado');
        this.goBack();
        return;
      }

      // Cargar secciones
      const seccionesData = await firstValueFrom(this.sectionService.getSectionsByCourse(cursoId));

      // Cargar lecciones y exámenes de cada sección
      this.secciones = await Promise.all(
        seccionesData.map(async (seccion) => {
          // Cargar lecciones con sus tareas
          const lecciones: LeccionConTareas[] = await Promise.all(
            seccion.elementos
              .filter(elemento => elemento.tipo === 'leccion')
              .map(async (elemento) => {
                const leccion = await this.lessonService.getLessonById(elemento.id);
                if (!leccion) return null;

                // Cargar tareas de esta lección
                const tareasIds = leccion.tareas || [];
                const tareasData: Tarea[] = await Promise.all(
                  tareasIds.map(async (tareaId) => {
                    const tarea = await this.taskService.getTaskById(tareaId);
                    if (!tarea) return null;

                    // Convertir Timestamps de Firestore a Date
                    return {
                      ...tarea,
                      fechaInicio: tarea.fechaInicio instanceof Date ? tarea.fechaInicio : (tarea.fechaInicio as any).toDate(),
                      fechaFin: tarea.fechaFin instanceof Date ? tarea.fechaFin : (tarea.fechaFin as any).toDate()
                    };
                  })
                ).then(tareas => tareas.filter((t): t is Tarea => t !== null));

                return {
                  ...leccion,
                  tareasData,
                  expanded: false
                };
              })
          ).then(lecciones => lecciones.filter((l): l is LeccionConTareas => l !== null));

          // Cargar exámenes de esta sección
          const examenesData: ExamenConIntentos[] = await this.loadExamenesSeccion(seccion.id);

          return {
            ...seccion,
            expanded: false,
            lecciones,
            examenesData
          };
        })
      );

      // Cargar automáticamente la primera lección de la primera sección
      if (this.secciones.length > 0 && this.secciones[0].lecciones.length > 0) {
        this.secciones[0].expanded = true;
        await this.loadLeccion(this.secciones[0], this.secciones[0].lecciones[0]);
      }

    } catch (error) {
      console.error('Error cargando curso:', error);
      alert('Error al cargar el curso');
    } finally {
      this.loading = false;
    }
  }

  toggleSeccion(seccion: SeccionExpandida) {
    seccion.expanded = !seccion.expanded;
  }

  toggleLeccion(leccion: LeccionConTareas) {
    console.log('Toggle lección:', leccion.titulo, 'Estado actual:', leccion.expanded);
    leccion.expanded = !leccion.expanded;
    console.log('Nuevo estado:', leccion.expanded);
  }

  async loadLeccion(seccion: SeccionExpandida, leccion: LeccionConTareas) {
    this.contenidoActual = {
      tipo: 'leccion',
      seccionTitulo: seccion.titulo,
      elemento: leccion,
      entrega: null
    };
    this.closeSidebarOnMobile(); // Cerrar sidebar en móviles
  }

  async loadTarea(seccion: SeccionExpandida, tarea: Tarea) {
    console.log('Cargando tarea:', tarea.titulo);
    console.log('User role:', this.userRole);
    console.log('Current user:', this.currentUser);

    this.contenidoActual = {
      tipo: 'tarea',
      seccionTitulo: seccion.titulo,
      elemento: tarea,
      entrega: null
    };

    // Si es estudiante, cargar su entrega
    if (this.userRole === 'estudiante') {
      console.log('Cargando entrega del estudiante...');
      this.contenidoActual.entrega = await this.taskService.getSubmissionByStudentAndTask(
        this.currentUser.id,
        tarea.id
      );
      console.log('Entrega cargada:', this.contenidoActual.entrega);

      // Convertir Timestamp a Date
      if (this.contenidoActual.entrega && this.contenidoActual.entrega.fechaEntrega) {
        this.contenidoActual.entrega.fechaEntrega = this.contenidoActual.entrega.fechaEntrega instanceof Date
          ? this.contenidoActual.entrega.fechaEntrega
          : (this.contenidoActual.entrega.fechaEntrega as any).toDate();
      }
    } else {
      console.log('No es estudiante, no se carga entrega');
    }
    this.closeSidebarOnMobile(); // Cerrar sidebar en móviles
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    // Solo cerrar automáticamente en móviles (ancho < 768px)
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  getLeccionActual(): Leccion | null {
    if (this.contenidoActual.tipo === 'leccion') {
      return this.contenidoActual.elemento as Leccion;
    }
    return null;
  }

  getTareaActual(): Tarea | null {
    if (this.contenidoActual.tipo === 'tarea') {
      return this.contenidoActual.elemento as Tarea;
    }
    return null;
  }

  getExamenActual(): ExamenConIntentos | null {
    if (this.contenidoActual.tipo === 'examen') {
      return this.contenidoActual.elemento as ExamenConIntentos;
    }
    return null;
  }

  getYoutubeEmbedUrl(url: string): SafeResourceUrl {
    if (!url) {
      console.warn('URL de YouTube vacía');
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    console.log('URL de YouTube original:', url);
    const videoId = this.extractYoutubeVideoId(url);
    console.log('Video ID extraído:', videoId);

    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    console.log('URL embed generada:', embedUrl);

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getSafePdfUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private extractYoutubeVideoId(url: string): string | null {
    if (!url) return null;

    // Intentar diferentes patrones de URL de YouTube
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/v/VIDEO_ID
    // https://youtube.com/live/VIDEO_ID

    let videoId = null;

    // Patrón para URLs completas
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/live\/)([^#&?\n]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Si es solo el ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    return videoId;
  }

  entregarTarea(tareaId: string) {
    this.router.navigate(['/tareas', tareaId, 'entregar'], {
      queryParams: { cursoId: this.curso?.id }
    });
  }

  verEntregas(tareaId: string) {
    this.router.navigate(['/tareas', tareaId, 'entregas']);
  }

  goToDashboard() {
    if (this.userRole === 'profesor') {
      this.router.navigate(['/profesor']);
    } else if (this.userRole === 'estudiante') {
      this.router.navigate(['/estudiante']);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  goBack() {
    this.goToDashboard();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isTaskOverdue(tarea: Tarea): boolean {
    if (!tarea.fechaFin) return false;
    return new Date(tarea.fechaFin) < new Date();
  }

  async loadExamenesSeccion(seccionId: string): Promise<ExamenConIntentos[]> {
    try {
      const examenes = await this.examService.getExamsBySection(seccionId);

      // Para cada examen, obtener los intentos del usuario actual (si es estudiante)
      const examenesConIntentos: ExamenConIntentos[] = await Promise.all(
        examenes.map(async (examen) => {
          let intentosUsuario: IntentoExamen[] = [];

          if (this.userRole === 'estudiante') {
            intentosUsuario = await this.examService.getAttemptsByStudentAndExam(
              this.currentUser.id,
              examen.id
            );
          }

          const disponible = this.examService.isExamAvailable(examen);
          const intentosRealizados = intentosUsuario.filter(i => i.estado === 'finalizado').length;
          const intentosRestantes = examen.intentosPermitidos - intentosRealizados;

          return {
            ...examen,
            intentosUsuario,
            disponible,
            intentosRestantes
          };
        })
      );

      return examenesConIntentos;
    } catch (error) {
      console.error('Error cargando exámenes de la sección:', error);
      return [];
    }
  }

  async loadExamen(seccion: SeccionExpandida, examen: ExamenConIntentos) {
    this.contenidoActual = {
      tipo: 'examen',
      seccionTitulo: seccion.titulo,
      elemento: examen,
      entrega: null
    };
    this.closeSidebarOnMobile();
  }

  tomarExamen(examenId: string) {
    this.router.navigate(['/examenes', examenId, 'tomar']);
  }

  verResultadosExamen(examenId: string, intentoId: string) {
    this.router.navigate(['/examenes', examenId, 'resultados', intentoId]);
  }

  isExamenDisponible(examen: ExamenConIntentos): boolean {
    return examen.disponible && examen.intentosRestantes > 0;
  }

  getEstadoExamen(examen: ExamenConIntentos): string {
    if (!examen.disponible) {
      const ahora = new Date();
      if (ahora < examen.fechaInicio) return 'Próximamente';
      if (ahora > examen.fechaFin) return 'Cerrado';
    }
    if (examen.intentosRestantes <= 0) return 'Sin intentos';
    return 'Disponible';
  }

  getMejorCalificacion(examen: ExamenConIntentos): number | null {
    const intentosFinalizados = examen.intentosUsuario.filter(i => i.estado === 'finalizado' && i.calificacion !== undefined);
    if (intentosFinalizados.length === 0) return null;
    return Math.max(...intentosFinalizados.map(i => i.calificacion!));
  }
}
