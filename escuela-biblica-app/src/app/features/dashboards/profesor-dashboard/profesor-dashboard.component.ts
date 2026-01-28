import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profesor-dashboard.component.html',
  styleUrl: './profesor-dashboard.component.scss'
})
export class ProfesorDashboardComponent implements OnInit {
  userName: string = '';
  cursos: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.nombre + ' ' + profile.apellido;
        this.cargarCursosAsignados();
      }
    });
  }

  cargarCursosAsignados() {
    // Datos de ejemplo - En producción esto vendría de Firestore
    this.cursos = [
      {
        id: 1,
        titulo: 'Evangelismo Personal',
        nivel: 'Básico',
        estudiantes: 15,
        proximaClase: new Date('2026-02-02'),
        imagen: 'assets/img/portfolio/1.png',
        tareasRevisar: 5
      },
      {
        id: 2,
        titulo: 'Homilética',
        nivel: 'Avanzado',
        estudiantes: 12,
        proximaClase: new Date('2026-02-02'),
        imagen: 'assets/img/portfolio/9.png',
        tareasRevisar: 3
      }
    ];
  }

  verCurso(cursoId: number) {
    this.router.navigate(['/profesor/curso', cursoId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
