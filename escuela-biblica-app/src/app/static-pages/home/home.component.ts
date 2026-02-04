import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HomeConfigService } from '../../core/services/home-config.service';
import { ConfiguracionHome } from '../../core/models/config-home.model';

declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  isSubmitting = false;
  isLoggedIn = false;
  userRole: string | null = null;

  // Configuración dinámica del home
  config: ConfiguracionHome | null = null;
  loadingConfig = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private homeConfigService: HomeConfigService
  ) {}

  async ngOnInit() {
    // Cargar configuración del home
    await this.cargarConfiguracion();

    // Verificar estado de autenticación
    this.authService.userProfile$.subscribe(userProfile => {
      this.isLoggedIn = !!userProfile;
      this.userRole = userProfile?.rol || null;
    });
  }

  /**
   * Carga la configuración dinámica del home desde Firestore
   * Implementa caché de 2 horas para rendimiento óptimo
   */
  private async cargarConfiguracion() {
    try {
      this.loadingConfig = true;
      this.config = await this.homeConfigService.getConfiguracion();
    } catch (error) {
      console.error('Error cargando configuración del home:', error);
      // En caso de error, mantener null y el HTML mostrará valores por defecto
    } finally {
      this.loadingConfig = false;
    }
  }

  ngAfterViewInit() {
    // Configurar scroll suave para los enlaces de anclaje
    this.setupSmoothScrolling();
  }

  navigateToDashboard() {
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (this.userRole === 'profesor') {
      this.router.navigate(['/profesor']);
    } else if (this.userRole === 'estudiante') {
      this.router.navigate(['/estudiante']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && href !== '#!') {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            // Actualizar URL sin recargar la página
            window.history.pushState(null, '', href);
          }
        }
      });
    });
  }

  materias = [
    { id: 1, titulo: 'Evangelismo Personal', curso: 'Curso Básico', imagen: 'assets/img/portfolio/1.png', enCurso: true },
    { id: 2, titulo: 'Vida Cristiana', curso: 'Curso Básico', imagen: 'assets/img/portfolio/2.jpg', enCurso: false },
    { id: 3, titulo: 'Síntesis del Antiguo Testamento', curso: 'Curso Básico', imagen: 'assets/img/portfolio/3.jpg', enCurso: false },
    { id: 4, titulo: 'Síntesis del Nuevo Testamento', curso: 'Curso Básico', imagen: 'assets/img/portfolio/4.jpg', enCurso: false },
    { id: 5, titulo: 'Servicio Ministerial', curso: 'Curso Básico', imagen: 'assets/img/portfolio/5.jpg', enCurso: false },
    { id: 6, titulo: 'Métodos de Evangelismo General', curso: 'Curso Avanzado', imagen: 'assets/img/portfolio/6.png', enCurso: true },
    { id: 7, titulo: 'Introducción a la Teología Sistemática', curso: 'Curso Avanzado', imagen: 'assets/img/portfolio/7.png', enCurso: false },
    { id: 8, titulo: 'Bibliología', curso: 'Curso Avanzado', imagen: 'assets/img/portfolio/8.png', enCurso: false },
    { id: 9, titulo: 'Homilética', curso: 'Curso Avanzado', imagen: 'assets/img/portfolio/9.png', enCurso: false },
    { id: 10, titulo: 'Misiología', curso: 'Curso Avanzado', imagen: 'assets/img/portfolio/10.png', enCurso: false }
  ];

  profesores = [
    { nombre: 'Eben Ezer Cayo', materia: 'Métodos de evangelismo general y Homilética', imagen: 'assets/img/team/1.jpg' },
    { nombre: 'Cristian Villafuerte', materia: 'Vida Cristiana', imagen: 'assets/img/team/2.jpg' },
    { nombre: 'Marco Sanchez', materia: 'Síntesis del Antiguo Testamento', imagen: 'assets/img/team/8.jpg' },
    { nombre: 'Eliezer Villafuerte', materia: 'Introducción a la Teología Sistemática y Servicio Ministerial', imagen: 'assets/img/team/7.jpg' },
    { nombre: 'Hernán Pérez', materia: 'Evangelismo Personal', imagen: 'assets/img/team/5.jpg' },
    { nombre: 'Efrain Villafuerte', materia: 'Síntesis del Nuevo Testamento', imagen: 'assets/img/team/6.jpg' },
    { nombre: 'Kevin Franco', materia: 'Bibliología', imagen: 'assets/img/team/4.jpg' },
    { nombre: 'Freddy Uvaldez', materia: 'Misiología', imagen: 'assets/img/team/9.jpg' }
  ];

  async onSubmit(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;

    const formElement = event.target as HTMLFormElement;
    const formData = {
      nombre: (formElement.querySelector('#name') as HTMLInputElement).value,
      curso: (formElement.querySelector('#curso') as HTMLSelectElement).value,
      celular: (formElement.querySelector('#phone') as HTMLInputElement).value,
      observacion: (formElement.querySelector('#message') as HTMLTextAreaElement).value
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbwiq3qLw565PE5mJJIqH-RauNBgzUYyMyg0xVVlJXLemRq3brgfpL_R3bDTR4mPi2U/exec', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors'
      });

      formElement.reset();
      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();
    } catch (error) {
      const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
      errorModal.show();
    } finally {
      this.isSubmitting = false;
    }
  }
}
