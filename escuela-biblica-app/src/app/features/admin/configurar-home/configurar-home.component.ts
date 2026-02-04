import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeConfigService } from '../../../core/services/home-config.service';
import { AuthService } from '../../../core/services/auth.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { ConfiguracionHome } from '../../../core/models/config-home.model';

@Component({
  selector: 'app-configurar-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configurar-home.component.html',
  styleUrl: './configurar-home.component.scss'
})
export class ConfigurarHomeComponent implements OnInit {
  heroForm!: FormGroup;
  cursosForm!: FormGroup;
  config: ConfiguracionHome | null = null;
  loading = true;
  saving = false;
  uploadingImage = false;
  currentUserId: string = '';
  mensaje: { tipo: 'success' | 'error' | 'info'; texto: string } | null = null;

  // Tabs de navegación
  tabActiva: 'hero' | 'cursos' = 'hero';

  // Lista de iconos disponibles para cursos
  iconosDisponibles = [
    { clase: 'fa-book-reader', nombre: 'Libro y Lector' },
    { clase: 'fa-graduation-cap', nombre: 'Birrete de Graduación' },
    { clase: 'fa-book-open', nombre: 'Libro Abierto' },
    { clase: 'fa-book', nombre: 'Libro' },
    { clase: 'fa-bible', nombre: 'Biblia' },
    { clase: 'fa-cross', nombre: 'Cruz' },
    { clase: 'fa-church', nombre: 'Iglesia' },
    { clase: 'fa-pray', nombre: 'Oración' },
    { clase: 'fa-hands-praying', nombre: 'Manos Orando' },
    { clase: 'fa-dove', nombre: 'Paloma' },
    { clase: 'fa-user-graduate', nombre: 'Estudiante Graduado' },
    { clase: 'fa-chalkboard-teacher', nombre: 'Profesor' },
    { clase: 'fa-pencil-alt', nombre: 'Lápiz' },
    { clase: 'fa-scroll', nombre: 'Pergamino' },
    { clase: 'fa-crown', nombre: 'Corona' },
    { clase: 'fa-heart', nombre: 'Corazón' },
    { clase: 'fa-star', nombre: 'Estrella' },
    { clase: 'fa-lightbulb', nombre: 'Idea/Luz' },
    { clase: 'fa-seedling', nombre: 'Semilla/Crecimiento' },
    { clase: 'fa-hands', nombre: 'Manos' },
    { clase: 'fa-users', nombre: 'Grupo de Personas' },
    { clase: 'fa-user-friends', nombre: 'Amigos' },
    { clase: 'fa-certificate', nombre: 'Certificado' },
    { clase: 'fa-award', nombre: 'Premio' }
  ];

  constructor(
    private fb: FormBuilder,
    private homeConfigService: HomeConfigService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Obtener usuario actual
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.currentUserId = profile.id || '';

        // Verificar que sea admin
        if (profile.rol !== 'admin') {
          this.router.navigate(['/']);
          return;
        }
      }
    });

    // Crear formulario Hero
    this.heroForm = this.fb.group({
      subtitulo1: ['', Validators.required],
      subtitulo2: ['', Validators.required],
      titulo: ['', Validators.required],
      botonTexto: ['', Validators.required],
      botonLink: ['', Validators.required]
    });

    // Crear formulario Cursos
    this.cursosForm = this.fb.group({
      visible: [true],
      titulo: ['', Validators.required],
      subtitulo: ['', Validators.required],
      cursos: this.fb.array([])
    });

    // Cargar configuración actual
    await this.cargarConfiguracion();
  }

  async cargarConfiguracion() {
    try {
      this.loading = true;
      this.config = await this.homeConfigService.getConfiguracion();

      // Poblar formulario Hero con valores actuales
      if (this.config) {
        this.heroForm.patchValue({
          subtitulo1: this.config.hero.subtitulo1,
          subtitulo2: this.config.hero.subtitulo2,
          titulo: this.config.hero.titulo,
          botonTexto: this.config.hero.botonTexto,
          botonLink: this.config.hero.botonLink
        });

        // Poblar formulario Cursos si existe
        if (this.config.seccionCursos) {
          this.cursosForm.patchValue({
            visible: this.config.seccionCursos.visible,
            titulo: this.config.seccionCursos.titulo,
            subtitulo: this.config.seccionCursos.subtitulo
          });

          // Limpiar y repoblar array de cursos
          this.cursos.clear();
          this.config.seccionCursos.cursos.forEach(curso => {
            this.cursos.push(this.crearCursoForm(curso));
          });
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.mostrarMensaje('error', 'Error al cargar la configuración del home');
    } finally {
      this.loading = false;
    }
  }

  // ===== HELPERS PARA FORM ARRAYS =====

  get cursos(): FormArray {
    return this.cursosForm.get('cursos') as FormArray;
  }

  crearCursoForm(curso?: any): FormGroup {
    const cursoGroup = this.fb.group({
      titulo: [curso?.titulo || '', Validators.required],
      subtitulo: [curso?.subtitulo || '', Validators.required],
      icono: [curso?.icono || 'fa-book', Validators.required],
      descripcion: [curso?.descripcion || '', Validators.required],
      materias: this.fb.array([])
    });

    // Agregar materias si existen
    if (curso?.materias) {
      const materiasArray = cursoGroup.get('materias') as FormArray;
      curso.materias.forEach((materia: any) => {
        materiasArray.push(this.crearMateriaForm(materia));
      });
    }

    return cursoGroup;
  }

  crearMateriaForm(materia?: any): FormGroup {
    return this.fb.group({
      nombre: [materia?.nombre || '', Validators.required],
      estado: [materia?.estado || null]
    });
  }

  getMaterias(cursoIndex: number): FormArray {
    return this.cursos.at(cursoIndex).get('materias') as FormArray;
  }

  agregarCurso() {
    this.cursos.push(this.crearCursoForm());
  }

  eliminarCurso(index: number) {
    if (confirm('¿Eliminar este curso?')) {
      this.cursos.removeAt(index);
    }
  }

  agregarMateria(cursoIndex: number) {
    this.getMaterias(cursoIndex).push(this.crearMateriaForm());
  }

  eliminarMateria(cursoIndex: number, materiaIndex: number) {
    this.getMaterias(cursoIndex).removeAt(materiaIndex);
  }

  // ===== SUBIDA DE IMAGEN =====

  async onImagenFondoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      this.mostrarMensaje('error', 'Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.mostrarMensaje('error', 'La imagen no debe superar los 5MB');
      return;
    }

    try {
      this.uploadingImage = true;
      this.mostrarMensaje('info', 'Subiendo imagen...');

      const imageUrl = await this.cloudinaryService.uploadImage(file);

      // Actualizar config local
      if (this.config) {
        this.config.hero.imagenFondo = imageUrl;
      }

      this.mostrarMensaje('success', 'Imagen subida exitosamente. Guarda los cambios para aplicar.');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.mostrarMensaje('error', 'Error al subir la imagen. Intenta nuevamente.');
    } finally {
      this.uploadingImage = false;
    }
  }

  eliminarImagenFondo() {
    if (confirm('¿Eliminar la imagen de fondo? Se usará la imagen por defecto.')) {
      if (this.config) {
        this.config.hero.imagenFondo = undefined;
      }
      this.mostrarMensaje('info', 'Imagen eliminada. Guarda los cambios para aplicar.');
    }
  }

  // ===== GUARDAR CAMBIOS =====

  async guardarCambios() {
    if (this.heroForm.invalid) {
      this.mostrarMensaje('error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!this.currentUserId) {
      this.mostrarMensaje('error', 'No se pudo identificar al usuario');
      return;
    }

    try {
      this.saving = true;

      const heroConfig: any = {
        subtitulo1: this.heroForm.value.subtitulo1,
        subtitulo2: this.heroForm.value.subtitulo2,
        titulo: this.heroForm.value.titulo,
        botonTexto: this.heroForm.value.botonTexto,
        botonLink: this.heroForm.value.botonLink
      };

      // Solo incluir imagenFondo si existe (evitar undefined en Firestore)
      if (this.config?.hero?.imagenFondo) {
        heroConfig.imagenFondo = this.config.hero.imagenFondo;
      }

      await this.homeConfigService.updateHero(heroConfig, this.currentUserId);

      this.mostrarMensaje('success', '✅ Cambios guardados exitosamente. El home se actualizará automáticamente.');

      // Recargar configuración
      await this.cargarConfiguracion();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      this.mostrarMensaje('error', 'Error al guardar los cambios. Intenta nuevamente.');
    } finally {
      this.saving = false;
    }
  }

  async guardarCambiosCursos() {
    if (this.cursosForm.invalid) {
      this.mostrarMensaje('error', 'Por favor completa todos los campos requeridos en los cursos');
      return;
    }

    if (!this.currentUserId) {
      this.mostrarMensaje('error', 'No se pudo identificar al usuario');
      return;
    }

    try {
      this.saving = true;

      const cursosConfig = this.cursosForm.value;

      await this.homeConfigService.updateSeccionCursos(cursosConfig, this.currentUserId);

      this.mostrarMensaje('success', '✅ Sección Cursos actualizada exitosamente.');

      // Recargar configuración
      await this.cargarConfiguracion();
    } catch (error) {
      console.error('Error guardando cambios de cursos:', error);
      this.mostrarMensaje('error', 'Error al guardar los cambios de cursos.');
    } finally {
      this.saving = false;
    }
  }

  cambiarTab(tab: 'hero' | 'cursos') {
    this.tabActiva = tab;
  }

  async resetearValores() {
    if (!confirm('¿Estás seguro de restablecer los valores por defecto? Esto sobrescribirá todos los cambios.')) {
      return;
    }

    try {
      this.saving = true;
      await this.homeConfigService.resetToDefault(this.currentUserId);
      this.mostrarMensaje('info', 'Valores restablecidos a los originales');
      await this.cargarConfiguracion();
    } catch (error) {
      console.error('Error reseteando valores:', error);
      this.mostrarMensaje('error', 'Error al restablecer valores');
    } finally {
      this.saving = false;
    }
  }

  verVistaPrevia() {
    // Abrir home en nueva pestaña
    window.open('/home', '_blank');
  }

  private mostrarMensaje(tipo: 'success' | 'error' | 'info', texto: string) {
    this.mensaje = { tipo, texto };

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.mensaje = null;
    }, 5000);
  }

  volverAdmin() {
    this.router.navigate(['/admin']);
  }
}
