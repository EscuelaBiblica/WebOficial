import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { UserService } from '../../../core/services/user.service';
import { ProgressUnlockService } from '../../../core/services/progress-unlock.service';
import { Router } from '@angular/router';
import { Curso } from '../../../core/models/course.model';
import { ProgresoSeccion } from '../../../core/models/section.model';

interface CursoConProgreso extends Curso {
  progreso: number;
  profesorNombre: string;
  tareasEntregadas: number;
  totalTareas: number;
}

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estudiante-dashboard.component.html',
  styleUrl: './estudiante-dashboard.component.scss'
})
export class EstudianteDashboardComponent implements OnInit {
  userName: string = '';
  cursos: CursoConProgreso[] = [];
  loading: boolean = true;
  currentUserId: string = '';
  cursosExpandidos: Set<string> = new Set();

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private userService: UserService,
    private progressUnlockService: ProgressUnlockService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.userProfile$.subscribe(async profile => {
      if (profile) {
        this.userName = profile.nombre + ' ' + profile.apellido;
        this.currentUserId = profile.id || '';
        await this.cargarCursosInscritos();
      }
    });
  }

  async cargarCursosInscritos() {
    this.loading = true;
    try {
      // Obtener cursos donde el estudiante está inscrito
      const cursosEstudiante = await this.courseService.getCoursesByEstudiante(this.currentUserId);

      if (cursosEstudiante.length === 0) {
        this.cursos = [];
        return;
      }

      // ✅ OPTIMIZACIÓN: Batch loading de profesores
      const profesorIds = cursosEstudiante
        .map(c => c.profesorId)
        .filter(id => id);
      const profesoresMap = await this.userService.getUsersByIds(profesorIds);

      // ✅ OPTIMIZACIÓN: Cargar progreso usando servicio en paralelo
      this.cursos = await Promise.all(
        cursosEstudiante.map(async curso => {
          // Obtener nombre del profesor desde el mapa
          let profesorNombre = 'Sin asignar';
          if (curso.profesorId) {
            const profesor = profesoresMap.get(curso.profesorId);
            if (profesor) {
              profesorNombre = `${profesor.nombre} ${profesor.apellido}`;
            }
          }

          // Usar servicio de progreso (con caché en Firestore)
          const estadoSecciones = await this.progressUnlockService.getEstadoSeccionesCurso(
            curso.id,
            this.currentUserId
          );

          // Calcular progreso promedio y estadísticas
          const { progreso, tareasEntregadas, totalTareas } = this.calcularEstadisticasCurso(estadoSecciones);

          return {
            ...curso,
            progreso,
            profesorNombre,
            tareasEntregadas,
            totalTareas
          };
        })
      );
    } catch (error) {
      console.error('Error cargando cursos:', error);
      alert('Error al cargar los cursos');
    } finally {
      this.loading = false;
    }
  }

  /**
   * ✅ Helper para calcular estadísticas del curso desde el progreso de secciones
   */
  private calcularEstadisticasCurso(estadoSecciones: Map<string, ProgresoSeccion>): {
    progreso: number;
    tareasEntregadas: number;
    totalTareas: number;
  } {
    if (estadoSecciones.size === 0) {
      return { progreso: 0, tareasEntregadas: 0, totalTareas: 0 };
    }

    let tareasEntregadasTotal = 0;
    let totalTareasTotal = 0;
    const progresos: number[] = [];

    estadoSecciones.forEach(seccion => {
      // Acumular tareas
      tareasEntregadasTotal += seccion.tareasEntregadas?.length || 0;
      // Estimar total de tareas de la sección basado en elementos
      const tareasSeccion = seccion.tareasEntregadas?.length || 0;
      totalTareasTotal += tareasSeccion;

      // Acumular porcentaje de completado
      progresos.push(seccion.porcentajeCompletado || 0);
    });

    // Calcular progreso promedio de todas las secciones
    const progresoPromedio = progresos.length > 0
      ? Math.round(progresos.reduce((a, b) => a + b, 0) / progresos.length)
      : 0;

    return {
      progreso: progresoPromedio,
      tareasEntregadas: tareasEntregadasTotal,
      totalTareas: totalTareasTotal
    };
  }

  verCurso(cursoId: string) {
    this.router.navigate(['/curso', cursoId]);
  }

  irASolicitarInscripcion() {
    this.router.navigate(['/estudiante/solicitar-inscripcion']);
  }

  verMisSolicitudes() {
    this.router.navigate(['/estudiante/mis-solicitudes']);
  }

  goToDashboard() {
    // Ya estamos en el dashboard
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  toggleDescripcion(cursoId: string): void {
    if (this.cursosExpandidos.has(cursoId)) {
      this.cursosExpandidos.delete(cursoId);
    } else {
      this.cursosExpandidos.add(cursoId);
    }
  }

  isExpanded(cursoId: string): boolean {
    return this.cursosExpandidos.has(cursoId);
  }

  getDescripcion(curso: CursoConProgreso): string {
    if (this.isExpanded(curso.id)) {
      return curso.descripcion;
    }
    return this.truncateText(curso.descripcion);
  }

  shouldShowToggle(descripcion: string): boolean {
    return !!(descripcion && descripcion.length > 100);
  }
}
