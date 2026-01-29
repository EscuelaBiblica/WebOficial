import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GradingService } from '../../../core/services/grading.service';
import { LibroCalificaciones, FilaLibroCalificaciones } from '../../../core/models/grading.model';

@Component({
  selector: 'app-libro-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libro-calificaciones.component.html',
  styleUrl: './libro-calificaciones.component.scss'
})
export class LibroCalificacionesComponent implements OnInit {
  cursoId!: string;
  libro?: LibroCalificaciones;
  loading = false;
  filtroEstado: 'todos' | 'aprobado' | 'desaprobado' | 'en_progreso' = 'todos';
  busqueda = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gradingService: GradingService
  ) {}

  ngOnInit(): void {
    this.cursoId = this.route.snapshot.paramMap.get('cursoId')!;
    this.loadLibro();
  }

  async loadLibro(): Promise<void> {
    this.loading = true;
    try {
      this.libro = await this.gradingService.getLibroCalificaciones(this.cursoId);
    } catch (error) {
      console.error('Error al cargar libro de calificaciones:', error);
      alert('Error al cargar las calificaciones. Asegúrate de configurar las ponderaciones primero.');
    } finally {
      this.loading = false;
    }
  }

  get estudiantesFiltrados(): FilaLibroCalificaciones[] {
    if (!this.libro) return [];

    let resultado = this.libro.estudiantes;

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(e => e.estado === this.filtroEstado);
    }

    // Filtrar por búsqueda
    if (this.busqueda) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(e =>
        e.nombreEstudiante.toLowerCase().includes(termino) ||
        e.email.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }

  getEstadoClase(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'badge-aprobado';
      case 'desaprobado': return 'badge-desaprobado';
      case 'en_progreso': return 'badge-progreso';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'Aprobado';
      case 'desaprobado': return 'Desaprobado';
      case 'en_progreso': return 'En Progreso';
      default: return estado;
    }
  }

  getCalificacionClase(calificacion: number | null): string {
    if (!this.libro || calificacion === null) return '';

    const escala = this.libro.configuracion.escalaCalificacion;

    if (calificacion >= (escala.excelente || 90)) return 'cal-excelente';
    if (calificacion >= (escala.bueno || 75)) return 'cal-bueno';
    if (calificacion >= (escala.regular || 60)) return 'cal-regular';
    return 'cal-desaprobado';
  }

  configurar(): void {
    this.router.navigate(['/cursos', this.cursoId, 'configurar-calificaciones']);
  }

  exportarExcel(): void {
    // TODO: Implementar exportación a Excel
    alert('Funcionalidad de exportación próximamente');
  }

  verProgreso(estudianteId: string): void {
    this.router.navigate(['/cursos', this.cursoId, 'estudiantes', estudianteId, 'progreso']);
  }

  volver(): void {
    this.router.navigate(['/cursos', this.cursoId]);
  }

  get estadisticas() {
    if (!this.libro) return null;

    const total = this.libro.estudiantes.length;
    const aprobados = this.libro.estudiantes.filter(e => e.estado === 'aprobado').length;
    const desaprobados = this.libro.estudiantes.filter(e => e.estado === 'desaprobado').length;
    const enProgreso = this.libro.estudiantes.filter(e => e.estado === 'en_progreso').length;
    const promedio = total > 0
      ? this.libro.estudiantes.reduce((sum, e) => sum + e.calificacionFinal, 0) / total
      : 0;

    return {
      total,
      aprobados,
      desaprobados,
      enProgreso,
      promedio: Math.round(promedio * 100) / 100,
      tasaAprobacion: total > 0 ? Math.round((aprobados / total) * 100) : 0
    };
  }
}
