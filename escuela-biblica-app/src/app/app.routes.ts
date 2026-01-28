import { Routes } from '@angular/router';

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
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
