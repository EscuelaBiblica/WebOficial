import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HomeConfigService } from '../../core/services/home-config.service';
import { ConfiguracionHome, CursoInfo, MateriaDetalle, TimelineItem } from '../../core/models/config-home.model';

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

  // Datos de fallback para cursos (si no hay config en Firestore)
  cursosDefault: CursoInfo[] = [
    {
      titulo: 'Básico',
      subtitulo: 'Estudio Bíblico Fundamental',
      icono: 'fa-book-reader',
      descripcion: 'Este curso introduce los principios básicos del estudio de la Biblia. Ideal para quienes desean establecer una base sólida en su camino de fe y servicio cristiano.',
      materias: [
        { nombre: 'Evangelismo Personal', estado: 'en-curso' },
        { nombre: 'Vida Cristiana', estado: null },
        { nombre: 'Síntesis del Antiguo Testamento', estado: null },
        { nombre: 'Síntesis del Nuevo Testamento', estado: null },
        { nombre: 'Servicio Ministerial', estado: null }
      ]
    },
    {
      titulo: 'Avanzado',
      subtitulo: 'Teología y Evangelismo Profesional',
      icono: 'fa-graduation-cap',
      descripcion: 'Este curso profundiza en el estudio avanzado de la Biblia y la teología cristiana. Está diseñado para aquellos que buscan un conocimiento más profundo para ejercer un liderazgo efectivo en la iglesia y en la misión cristiana.',
      materias: [
        { nombre: 'Métodos de Evangelismo General', estado: 'en-curso' },
        { nombre: 'Introducción a la Teología Sistemática', estado: null },
        { nombre: 'Bibliología', estado: null },
        { nombre: 'Homilética', estado: null },
        { nombre: 'Misiología', estado: null }
      ]
    }
  ];

  // Datos de fallback para materias/portfolio (si no hay config en Firestore)
  materiasDefault: MateriaDetalle[] = [
    {
      titulo: "Evangelismo Personal",
      subtitulo: "(Curso Basico)",
      imagen: "assets/img/portfolio/1.png",
      estado: "en-curso",
      modal: {
        tituloModal: "Evangelismo Personal - Curso Básico",
        intro: "Un curso fundamental para aprender a compartir tu fe de manera efectiva y con amor.",
        imagenModal: "assets/img/portfolio/1.png",
        descripcion: "Este curso te equipará con las herramientas necesarias para compartir el evangelio de manera natural y efectiva en tu vida diaria. Aprenderás métodos prácticos de evangelización personal y cómo responder preguntas comunes sobre la fe cristiana.",
        fechaInicio: "1 de febrero de 2025",
        profesor: "Pastor Juan Pérez"
      }
    },
    {
      titulo: "Vida Cristiana",
      subtitulo: "(Curso Basico)",
      imagen: "assets/img/portfolio/2.jpg",
      estado: "en-curso",
      modal: {
        tituloModal: "Vida Cristiana - Curso Básico",
        intro: "Fundamentos esenciales para vivir una vida cristiana plena y fructífera.",
        imagenModal: "assets/img/portfolio/2.jpg",
        descripcion: "Explora los principios fundamentales de la vida cristiana, incluyendo la oración, el estudio bíblico, la adoración, y cómo desarrollar una relación personal con Dios. Este curso te ayudará a establecer hábitos espirituales saludables.",
        fechaInicio: "1 de febrero de 2025",
        profesor: "Pastora María González"
      }
    },
    {
      titulo: "Síntesis del Antiguo Testamento",
      subtitulo: "(Curso Basico)",
      imagen: "assets/img/portfolio/3.jpg",
      estado: "en-curso",
      modal: {
        tituloModal: "Síntesis del Antiguo Testamento",
        intro: "Un recorrido completo por la historia y los mensajes del Antiguo Testamento.",
        imagenModal: "assets/img/portfolio/3.jpg",
        descripcion: "Descubre la riqueza del Antiguo Testamento a través de un estudio panorámico que te ayudará a comprender el contexto histórico, los temas principales y cómo cada libro apunta hacia Cristo.",
        fechaInicio: "1 de febrero de 2025",
        profesor: "Pastor Roberto Méndez"
      }
    },
    {
      titulo: "Síntesis del Nuevo Testamento",
      subtitulo: "(Curso Basico)",
      imagen: "assets/img/portfolio/4.jpg",
      estado: "en-curso",
      modal: {
        tituloModal: "Síntesis del Nuevo Testamento",
        intro: "Explorando el mensaje transformador del Nuevo Testamento.",
        imagenModal: "assets/img/portfolio/4.jpg",
        descripcion: "Un estudio integral del Nuevo Testamento que te ayudará a comprender el ministerio de Jesús, el nacimiento de la iglesia, y las enseñanzas apostólicas para la vida cristiana.",
        fechaInicio: "1 de febrero de 2025",
        profesor: "Pastor Carlos Ramírez"
      }
    },
    {
      titulo: "Servicio Ministerial",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/5.jpg",
      estado: "en-curso",
      modal: {
        tituloModal: "Servicio Ministerial - Curso Avanzado",
        intro: "Preparación práctica para el servicio efectivo en el ministerio cristiano.",
        imagenModal: "assets/img/portfolio/5.jpg",
        descripcion: "Desarrolla las habilidades y el carácter necesarios para servir efectivamente en el ministerio. Incluye liderazgo de grupos pequeños, consejería básica, y administración ministerial.",
        fechaInicio: "Próximamente",
        profesor: "Pastor David Torres"
      }
    },
    {
      titulo: "Métodos de Evangelismo",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/6.png",
      estado: "proximamente",
      modal: {
        tituloModal: "Métodos de Evangelismo - Curso Avanzado",
        intro: "Estrategias avanzadas para alcanzar a otros con el mensaje del evangelio.",
        imagenModal: "assets/img/portfolio/6.png",
        descripcion: "Profundiza en diversos métodos y estrategias de evangelización, incluyendo evangelismo relacional, evangelismo de eventos, y uso de medios digitales para compartir el evangelio.",
        fechaInicio: "Marzo 2025",
        profesor: "Pastor Juan Pérez"
      }
    },
    {
      titulo: "Teología Sistemática",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/7.png",
      estado: "proximamente",
      modal: {
        tituloModal: "Teología Sistemática - Curso Avanzado",
        intro: "Un estudio organizado de las doctrinas fundamentales de la fe cristiana.",
        imagenModal: "assets/img/portfolio/7.png",
        descripcion: "Explora las doctrinas esenciales del cristianismo de manera sistemática, incluyendo teología propia, cristología, pneumatología, soteriología, eclesiología y escatología.",
        fechaInicio: "Abril 2025",
        profesor: "Dr. Fernando Sánchez"
      }
    },
    {
      titulo: "Bibliología",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/8.png",
      estado: "proximamente",
      modal: {
        tituloModal: "Bibliología - Curso Avanzado",
        intro: "El estudio de la naturaleza, inspiración y autoridad de las Sagradas Escrituras.",
        imagenModal: "assets/img/portfolio/8.png",
        descripcion: "Examina la formación del canon bíblico, la inspiración divina de las Escrituras, principios de interpretación bíblica, y cómo defender la confiabilidad de la Biblia.",
        fechaInicio: "Mayo 2025",
        profesor: "Dr. Fernando Sánchez"
      }
    },
    {
      titulo: "Homilética",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/9.png",
      estado: "proximamente",
      modal: {
        tituloModal: "Homilética - Curso Avanzado",
        intro: "El arte y la ciencia de la preparación y predicación de sermones bíblicos.",
        imagenModal: "assets/img/portfolio/9.png",
        descripcion: "Aprende a preparar y presentar sermones bíblicos efectivos. Incluye exégesis, estructura de sermones, aplicación práctica, y técnicas de comunicación.",
        fechaInicio: "Junio 2025",
        profesor: "Pastor Roberto Méndez"
      }
    },
    {
      titulo: "Misiología",
      subtitulo: "(Curso Avanzado)",
      imagen: "assets/img/portfolio/10.png",
      estado: "proximamente",
      modal: {
        tituloModal: "Misiología - Curso Avanzado",
        intro: "El estudio de la misión de Dios y la expansión del evangelio en el mundo.",
        imagenModal: "assets/img/portfolio/10.png",
        descripcion: "Explora la naturaleza de la misión cristiana, estrategias misioneras, contextos culturales, y cómo participar efectivamente en la Gran Comisión en el mundo contemporáneo.",
        fechaInicio: "Julio 2025",
        profesor: "Misionera Ana López"
      }
    }
  ];

  // Datos de fallback para timeline/about (si no hay config en Firestore)
  aboutItemsDefault: TimelineItem[] = [
    {
      titulo: 'MISIÓN',
      subtitulo: 'Formación Integral en la Palabra',
      descripcion: 'Formar creyentes firmes en la fe, con un conocimiento profundo de la Palabra de Dios, capacitados para aplicar principios bíblicos en su vida diaria y preparados para servir en la obra del Señor.',
      imagen: 'assets/img/about/1.jpg',
      invertido: false
    },
    {
      titulo: 'VISIÓN',
      subtitulo: 'Creciendo en el Conocimiento y Servicio',
      descripcion: 'Ofrecer una enseñanza sólida y práctica, que impulse el crecimiento espiritual de los creyentes y equipe obreros para el servicio en la iglesia local y la expansión del evangelio.',
      imagen: 'assets/img/about/2.webp',
      invertido: true
    },
    {
      titulo: 'OBJETIVO',
      subtitulo: 'Capacitación para la Vida y el Ministerio',
      descripcion: 'Proporcionar una educación bíblica estructurada, que ayude a los estudiantes a desarrollar su vida espiritual, doctrinal y ministerial, fortaleciendo su relación con Dios y su compromiso con la gran comisión.',
      imagen: 'assets/img/about/3.jpg',
      invertido: false
    },
    {
      titulo: 'COMPROMISO',
      subtitulo: 'Edificando una Generación Fiel',
      descripcion: 'Promover una formación cristiana que transforme vidas, fomentando el amor por Dios, el estudio de las Escrituras y el servicio activo en la iglesia, para que cada creyente impacte su entorno con el evangelio.',
      imagen: 'assets/img/about/4.webp',
      invertido: true
    }
  ];

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
