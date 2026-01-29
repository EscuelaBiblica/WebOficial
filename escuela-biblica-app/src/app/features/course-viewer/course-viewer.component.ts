import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CourseService } from '../../core/services/course.service';
import { SectionService } from '../../core/services/section.service';
import { LessonService } from '../../core/services/lesson.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso } from '../../core/models/course.model';
import { Seccion, ElementoSeccion } from '../../core/models/section.model';
import { Leccion } from '../../core/models/lesson.model';
import { Tarea, EntregaTarea } from '../../core/models/task.model';

interface SeccionExpandida extends Seccion {
  expanded: boolean;
  elementos: ElementoConDetalles[];
}

interface ElementoConDetalles extends ElementoSeccion {
  titulo: string;
  detalles?: Leccion | Tarea;
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

  // Contenido actual
  contenidoActual: {
    tipo: 'leccion' | 'tarea' | 'examen' | null;
    seccionTitulo: string;
    elemento: Leccion | Tarea | null;
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

      // Cargar elementos de cada sección
      this.secciones = await Promise.all(
        seccionesData.map(async (seccion) => {
          const elementosConDetalles: ElementoConDetalles[] = await Promise.all(
            seccion.elementos.map(async (elemento) => {
              let titulo = '';
              let detalles: Leccion | Tarea | undefined;

              if (elemento.tipo === 'leccion') {
                const leccion = await this.lessonService.getLessonById(elemento.id);
                if (leccion) {
                  titulo = leccion.titulo;
                  detalles = leccion;
                }
              } else if (elemento.tipo === 'tarea') {
                const tarea = await this.taskService.getTaskById(elemento.id);
                if (tarea) {
                  titulo = tarea.titulo;
                  // Convertir Timestamps de Firestore a Date
                  detalles = {
                    ...tarea,
                    fechaInicio: tarea.fechaInicio instanceof Date ? tarea.fechaInicio : (tarea.fechaInicio as any).toDate(),
                    fechaFin: tarea.fechaFin instanceof Date ? tarea.fechaFin : (tarea.fechaFin as any).toDate()
                  };
                }
              }

              return {
                ...elemento,
                titulo,
                detalles
              };
            })
          );

          return {
            ...seccion,
            expanded: false,
            elementos: elementosConDetalles
          };
        })
      );

      // Cargar automáticamente el primer elemento de la primera sección
      if (this.secciones.length > 0 && this.secciones[0].elementos.length > 0) {
        this.secciones[0].expanded = true;
        await this.loadContenido(this.secciones[0], this.secciones[0].elementos[0]);
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

  async loadContenido(seccion: SeccionExpandida, elemento: ElementoConDetalles) {
    if (!elemento.detalles) return;

    let elementoConvertido = elemento.detalles;

    // Convertir fechas de Timestamp a Date si es una tarea
    if (elemento.tipo === 'tarea') {
      const tarea = elemento.detalles as Tarea;
      elementoConvertido = {
        ...tarea,
        fechaInicio: tarea.fechaInicio instanceof Date ? tarea.fechaInicio : (tarea.fechaInicio as any).toDate(),
        fechaFin: tarea.fechaFin instanceof Date ? tarea.fechaFin : (tarea.fechaFin as any).toDate()
      };
    }

    this.contenidoActual = {
      tipo: elemento.tipo,
      seccionTitulo: seccion.titulo,
      elemento: elementoConvertido,
      entrega: null
    };

    // Si es tarea y es estudiante, cargar su entrega
    if (elemento.tipo === 'tarea' && this.userRole === 'estudiante') {
      const tarea = elementoConvertido as Tarea;
      this.contenidoActual.entrega = await this.taskService.getSubmissionByStudentAndTask(
        this.currentUser.id,
        tarea.id
      );
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

  getYoutubeEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.extractYoutubeVideoId(url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getSafePdfUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private extractYoutubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  entregarTarea(tareaId: string) {
    this.router.navigate(['/tareas', tareaId, 'entregar']);
  }

  verEntregas(tareaId: string) {
    this.router.navigate(['/secciones', this.contenidoActual.elemento?.['seccionId'], 'tareas']);
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
}
