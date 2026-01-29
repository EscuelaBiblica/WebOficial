import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { SectionService } from '../../../core/services/section.service';
import { TaskService } from '../../../core/services/task.service';
import { Router } from '@angular/router';
import { Curso } from '../../../core/models/course.model';
import { Seccion } from '../../../core/models/section.model';
import { EntregaTarea } from '../../../core/models/task.model';

interface CursoConEstadisticas extends Curso {
  totalSecciones: number;
  tareasRevisar: number;
}

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profesor-dashboard.component.html',
  styleUrl: './profesor-dashboard.component.scss'
})
export class ProfesorDashboardComponent implements OnInit {
  userName: string = '';
  cursos: CursoConEstadisticas[] = [];
  loading: boolean = true;
  currentUserId: string = '';

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private sectionService: SectionService,
    private taskService: TaskService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.userProfile$.subscribe(async profile => {
      if (profile) {
        this.userName = profile.nombre + ' ' + profile.apellido;
        this.currentUserId = profile.id || '';
        await this.cargarCursosAsignados();
      }
    });
  }

  async cargarCursosAsignados() {
    this.loading = true;
    try {
      // Obtener cursos del profesor
      const cursosProfesor = await this.courseService.getCoursesByProfesor(this.currentUserId);

      // Cargar estadísticas para cada curso
      this.cursos = await Promise.all(
        cursosProfesor.map(async curso => {
          // Contar secciones
          const secciones = await firstValueFrom(this.sectionService.getSectionsByCourse(curso.id));
          const totalSecciones = secciones.length;

          // Contar tareas pendientes de revisar
          let tareasRevisar = 0;
          for (const seccion of secciones) {
            const tareas = await firstValueFrom(this.taskService.getTasksBySection(seccion.id));
            if (tareas) {
              for (const tarea of tareas) {
                const entregas = await this.taskService.getSubmissionsByTask(tarea.id);
                // Contar entregas no calificadas
                tareasRevisar += entregas.filter(e => e.estado === 'entregada').length;
              }
            }
          }

          return {
            ...curso,
            totalSecciones,
            tareasRevisar
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

  verCurso(cursoId: string) {
    this.router.navigate(['/curso', cursoId]);
  }

  goToDashboard() {
    // Ya estamos en el dashboard
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
