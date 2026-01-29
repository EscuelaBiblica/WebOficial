import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { SectionService } from '../../../core/services/section.service';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { Curso } from '../../../core/models/course.model';
import { User } from '../../../core/models/user.model';

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

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private sectionService: SectionService,
    private taskService: TaskService,
    private userService: UserService,
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

      // Cargar progreso y estadísticas para cada curso
      this.cursos = await Promise.all(
        cursosEstudiante.map(async curso => {
          // Obtener nombre del profesor
          let profesorNombre = 'Sin asignar';
          if (curso.profesorId) {
            const profesor = await this.userService.getUserById(curso.profesorId);
            if (profesor) {
              profesorNombre = `${profesor.nombre} ${profesor.apellido}`;
            }
          }

          // Calcular progreso del curso
          const secciones = await firstValueFrom(this.sectionService.getSectionsByCourse(curso.id));
          let totalTareas = 0;
          let tareasEntregadas = 0;

          for (const seccion of secciones) {
            // Obtener tareas de la sección
            const tareas = await firstValueFrom(this.taskService.getTasksBySection(seccion.id));
            if (tareas) {
              totalTareas += tareas.length;

              // Verificar cuáles ha entregado el estudiante
              for (const tarea of tareas) {
                const entrega = await this.taskService.getSubmissionByStudentAndTask(
                  this.currentUserId,
                  tarea.id
                );
                if (entrega) {
                  tareasEntregadas++;
                }
              }
            }
          }

          // Calcular progreso (porcentaje de tareas entregadas)
          const progreso = totalTareas > 0 ? Math.round((tareasEntregadas / totalTareas) * 100) : 0;

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

  verCurso(cursoId: string) {
    this.router.navigate(['/cursos', cursoId, 'secciones']);
  }

  goToDashboard() {
    // Ya estamos en el dashboard
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
