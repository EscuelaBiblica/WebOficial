import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GradingService } from '../../../core/services/grading.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProgresoEstudiante, CalificacionEstudiante } from '../../../core/models/grading.model';

@Component({
  selector: 'app-progreso-estudiante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-estudiante.component.html',
  styleUrl: './progreso-estudiante.component.scss'
})
export class ProgresoEstudianteComponent implements OnInit {
  cursoId!: string;
  estudianteId!: string;
  progreso?: ProgresoEstudiante;
  calificacion?: CalificacionEstudiante;
  loading = false;
  cursoTitulo = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gradingService: GradingService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.cursoId = this.route.snapshot.paramMap.get('cursoId')!;
    const estudianteIdParam = this.route.snapshot.paramMap.get('estudianteId');

    // Si no se proporciona estudianteId, usar el usuario actual
    if (estudianteIdParam) {
      this.estudianteId = estudianteIdParam;
    } else {
      const currentUser = await this.authService.getCurrentUser();
      this.estudianteId = currentUser?.uid || '';
    }

    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      // Cargar progreso y calificación en paralelo
      const [progreso, calificacion] = await Promise.all([
        this.gradingService.calcularProgreso(this.estudianteId, this.cursoId),
        this.gradingService.calcularCalificacionEstudiante(this.estudianteId, this.cursoId)
      ]);

      this.progreso = progreso;
      this.calificacion = calificacion;

      // Obtener título del curso
      // TODO: Agregar método en un servicio de cursos
      this.cursoTitulo = 'Curso';
    } catch (error) {
      console.error('Error al cargar progreso:', error);
      alert('Error al cargar el progreso. Asegúrate de que el curso tenga configuración de calificaciones.');
    } finally {
      this.loading = false;
    }
  }

  get porcentajeTareasCompletadas(): number {
    if (!this.progreso || this.progreso.tareasTotales === 0) return 0;
    return Math.round((this.progreso.tareasEntregadas.length / this.progreso.tareasTotales) * 100);
  }

  get porcentajeExamenesCompletados(): number {
    if (!this.progreso || this.progreso.examenesTotales === 0) return 0;
    return Math.round((this.progreso.examenesRealizados.length / this.progreso.examenesTotales) * 100);
  }

  getEstadoClase(): string {
    if (!this.calificacion) return '';
    switch (this.calificacion.estado) {
      case 'aprobado': return 'estado-aprobado';
      case 'desaprobado': return 'estado-desaprobado';
      case 'en_progreso': return 'estado-progreso';
      default: return '';
    }
  }

  getEstadoTexto(): string {
    if (!this.calificacion) return 'Sin calificar';
    switch (this.calificacion.estado) {
      case 'aprobado': return 'Aprobado';
      case 'desaprobado': return 'Desaprobado';
      case 'en_progreso': return 'En Progreso';
      default: return this.calificacion.estado;
    }
  }

  getEstadoIcono(): string {
    if (!this.calificacion) return 'fa-hourglass';
    switch (this.calificacion.estado) {
      case 'aprobado': return 'fa-check-circle';
      case 'desaprobado': return 'fa-times-circle';
      case 'en_progreso': return 'fa-hourglass-half';
      default: return 'fa-question-circle';
    }
  }

  getCalificacionClase(calificacion: number): string {
    if (calificacion >= 90) return 'cal-excelente';
    if (calificacion >= 75) return 'cal-bueno';
    if (calificacion >= 60) return 'cal-regular';
    return 'cal-desaprobado';
  }

  volver(): void {
    this.router.navigate(['/curso', this.cursoId]);
  }
}
