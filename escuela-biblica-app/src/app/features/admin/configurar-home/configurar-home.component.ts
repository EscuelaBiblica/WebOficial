import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeConfigService } from '../../../core/services/home-config.service';
import { AuthService } from '../../../core/services/auth.service';
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
  config: ConfiguracionHome | null = null;
  loading = true;
  saving = false;
  currentUserId: string = '';
  mensaje: { tipo: 'success' | 'error' | 'info'; texto: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private homeConfigService: HomeConfigService,
    private authService: AuthService,
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

    // Crear formulario
    this.heroForm = this.fb.group({
      subtitulo1: ['', Validators.required],
      subtitulo2: ['', Validators.required],
      titulo: ['', Validators.required],
      botonTexto: ['', Validators.required],
      botonLink: ['', Validators.required]
    });

    // Cargar configuración actual
    await this.cargarConfiguracion();
  }

  async cargarConfiguracion() {
    try {
      this.loading = true;
      this.config = await this.homeConfigService.getConfiguracion();

      // Poblar formulario con valores actuales
      if (this.config) {
        this.heroForm.patchValue({
          subtitulo1: this.config.hero.subtitulo1,
          subtitulo2: this.config.hero.subtitulo2,
          titulo: this.config.hero.titulo,
          botonTexto: this.config.hero.botonTexto,
          botonLink: this.config.hero.botonLink
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      this.mostrarMensaje('error', 'Error al cargar la configuración del home');
    } finally {
      this.loading = false;
    }
  }

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
