import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { SectionService } from '../../core/services/section.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { Tarea, EntregaTarea } from '../../core/models/task.model';
import { Seccion } from '../../core/models/section.model';

@Component({
  selector: 'app-entregar-tarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entregar-tarea.component.html',
  styleUrl: './entregar-tarea.component.scss'
})
export class EntregarTareaComponent implements OnInit {
  tarea: Tarea | null = null;
  seccion: Seccion | null = null;
  entrega: EntregaTarea | null = null;
  contenidoTexto: string = '';
  archivos: string[] = [];
  uploadingFile: boolean = false;
  loading: boolean = false;
  currentUser: any = null;

  constructor(
    private taskService: TaskService,
    private sectionService: SectionService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const tareaId = this.route.snapshot.paramMap.get('tareaId');
    if (!tareaId) {
      alert('Tarea no especificada');
      this.goBack();
      return;
    }

    try {
      // Cargar la tarea
      this.tarea = await this.taskService.getTaskById(tareaId);
      if (!this.tarea) {
        alert('Tarea no encontrada');
        this.goBack();
        return;
      }

      // Cargar la lección para mostrar el nombre
      const lessonSnapshot = await this.sectionService.getSectionById(this.tarea.leccionId);
      this.seccion = lessonSnapshot;

      // Verificar si ya hay una entrega
      this.entrega = await this.taskService.getSubmissionByStudentAndTask(
        this.currentUser.uid,
        tareaId
      );

      // Si ya hay entrega, pre-llenar los campos
      if (this.entrega) {
        this.contenidoTexto = this.entrega.contenidoTexto || '';
        this.archivos = [...(this.entrega.archivos || [])];
      }
    } catch (error) {
      console.error('Error cargando tarea:', error);
      alert('Error al cargar la tarea');
      this.goBack();
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo si hay restricciones
    if (this.tarea?.archivosPermitidos && this.tarea.archivosPermitidos.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!this.tarea.archivosPermitidos.includes(extension || '')) {
        alert(`Solo se permiten archivos: ${this.tarea.archivosPermitidos.join(', ')}`);
        return;
      }
    }

    // Validar tamaño
    if (this.tarea?.tamanoMaximo) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > this.tarea.tamanoMaximo) {
        alert(`El archivo excede el tamaño máximo de ${this.tarea.tamanoMaximo} MB`);
        return;
      }
    }

    this.uploadingFile = true;
    try {
      const url = await this.cloudinaryService.uploadImage(file);
      this.archivos.push(url);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo');
    } finally {
      this.uploadingFile = false;
      // Limpiar el input
      event.target.value = '';
    }
  }

  removeFile(index: number) {
    if (confirm('¿Eliminar este archivo?')) {
      this.archivos.splice(index, 1);
    }
  }

  async submitTask() {
    if (!this.tarea || !this.currentUser) return;

    // Validar según tipo de entrega
    if (this.tarea.tipoEntrega === 'texto' || this.tarea.tipoEntrega === 'ambos') {
      if (!this.contenidoTexto.trim()) {
        alert('Debes escribir una respuesta en texto');
        return;
      }
    }

    if (this.tarea.tipoEntrega === 'archivo' || this.tarea.tipoEntrega === 'ambos') {
      if (this.archivos.length === 0) {
        alert('Debes adjuntar al menos un archivo');
        return;
      }
    }

    if (!confirm('¿Estás seguro de entregar esta tarea? Una vez entregada podrás editarla hasta la fecha límite.')) {
      return;
    }

    this.loading = true;
    try {
      const entregaData: Partial<EntregaTarea> = {
        tareaId: this.tarea.id,
        estudianteId: this.currentUser.uid,
        fechaEntrega: new Date(),
        estado: 'entregada'
      };

      // Agregar contenido según tipo
      if (this.tarea.tipoEntrega === 'texto' || this.tarea.tipoEntrega === 'ambos') {
        entregaData.contenidoTexto = this.contenidoTexto;
      }

      if (this.tarea.tipoEntrega === 'archivo' || this.tarea.tipoEntrega === 'ambos') {
        entregaData.archivos = this.archivos;
      }

      // Si ya existe una entrega, actualizar; si no, crear
      if (this.entrega) {
        entregaData.id = this.entrega.id;
      }

      await this.taskService.submitTask(entregaData as EntregaTarea);
      alert('Tarea entregada exitosamente');
      this.goBack();
    } catch (error) {
      console.error('Error entregando tarea:', error);
      alert('Error al entregar la tarea');
    } finally {
      this.loading = false;
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOverdue(): boolean {
    if (!this.tarea) return false;
    return this.taskService.isTaskOverdue(this.tarea);
  }

  isAvailable(): boolean {
    if (!this.tarea) return false;
    return this.taskService.isTaskAvailable(this.tarea);
  }

  canSubmit(): boolean {
    if (!this.tarea) return false;

    // No puede entregar si está fuera de fechas
    if (!this.isAvailable() || this.isOverdue()) {
      return false;
    }

    // No puede entregar si ya está calificada
    if (this.entrega?.estado === 'calificada') {
      return false;
    }

    return true;
  }

  getStatusMessage(): string {
    if (!this.tarea) return '';

    if (!this.isAvailable()) {
      return 'Esta tarea aún no está disponible';
    }

    if (this.isOverdue()) {
      return 'El plazo para entregar esta tarea ha expirado';
    }

    if (this.entrega?.estado === 'calificada') {
      return 'Esta tarea ya ha sido calificada y no puede modificarse';
    }

    if (this.entrega) {
      return 'Ya has entregado esta tarea. Puedes modificarla hasta la fecha límite.';
    }

    return '';
  }

  getTipoEntregaText(tipo: string): string {
    switch (tipo) {
      case 'texto': return 'Solo Texto';
      case 'archivo': return 'Solo Archivo';
      case 'ambos': return 'Texto y Archivo';
      default: return tipo;
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'calificada': return 'bg-success';
      case 'entregada': return 'bg-info';
      case 'retrasada': return 'bg-danger';
      case 'pendiente': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  goToDashboard() {
    this.router.navigate(['/estudiante']);
  }

  goBack() {
    if (this.seccion) {
      this.router.navigate(['/estudiante']);
    } else {
      this.router.navigate(['/estudiante']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
