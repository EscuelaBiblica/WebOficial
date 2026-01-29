import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { profesorGuard } from './core/guards/profesor.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./static-pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'nivel-basico',
    loadComponent: () => import('./static-pages/nivel-basico/nivel-basico.component').then(m => m.NivelBasicoComponent)
  },
  {
    path: 'nivel-avanzado',
    loadComponent: () => import('./static-pages/nivel-avanzado/nivel-avanzado.component').then(m => m.NivelAvanzadoComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  // Rutas protegidas por rol
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
  },
  {
    path: 'cursos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/courses/cursos.component').then(m => m.CursosComponent)
  },
  {
    path: 'cursos/:cursoId/secciones',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/sections/secciones.component').then(m => m.SeccionesComponent)
  },
  {
    path: 'curso/:cursoId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/course-viewer/course-viewer.component').then(m => m.CourseViewerComponent)
  },
  {
    path: 'secciones/:seccionId/lecciones',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/lessons/lecciones.component').then(m => m.LeccionesComponent)
  },
  {
    path: 'lecciones/:leccionId/tareas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/tasks/tareas.component').then(m => m.TareasComponent)
  },
  {
    path: 'secciones/:seccionId/examenes',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/exams/examenes.component').then(m => m.ExamenesComponent)
  },
  {
    path: 'secciones/:seccionId/examenes/crear',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/exams/crear-examen.component').then(m => m.CrearExamenComponent)
  },
  {
    path: 'secciones/:seccionId/examenes/:id/editar',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/exams/crear-examen.component').then(m => m.CrearExamenComponent)
  },
  {
    path: 'examenes/:id/tomar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/exams/tomar-examen.component').then(m => m.TomarExamenComponent)
  },
  {
    path: 'examenes/:examenId/resultados/:intentoId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/exams/resultado-examen.component').then(m => m.ResultadoExamenComponent)
  },
  {
    path: 'tareas/:tareaId/entregas',
    canActivate: [authGuard, profesorGuard],
    loadComponent: () => import('./features/tasks/lista-entregas.component').then(m => m.ListaEntregasComponent)
  },
  {
    path: 'tareas/:tareaId/calificar/:entregaId',
    canActivate: [authGuard, profesorGuard],
    loadComponent: () => import('./features/tasks/calificar.component').then(m => m.CalificarComponent)
  },
  {
    path: 'tareas/:tareaId/entregar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/entregar-tarea.component').then(m => m.EntregarTareaComponent)
  },
  {
    path: 'profesor',
    canActivate: [authGuard, profesorGuard],
    loadComponent: () => import('./features/dashboards/profesor-dashboard/profesor-dashboard.component').then(m => m.ProfesorDashboardComponent)
  },
  {
    path: 'estudiante',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboards/estudiante-dashboard/estudiante-dashboard.component').then(m => m.EstudianteDashboardComponent)
  },
  // Ruta legacy - redirige según el rol
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
