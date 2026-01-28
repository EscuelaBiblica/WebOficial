import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estudiante-dashboard.component.html',
  styleUrl: './estudiante-dashboard.component.scss'
})
export class EstudianteDashboardComponent implements OnInit {
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
        this.cargarCursosInscritos();
      }
    });
  }

  cargarCursosInscritos() {
    // Datos de ejemplo - En producción esto vendría de Firestore
    this.cursos = [
      {
        id: 1,
        titulo: 'Evangelismo Personal',
        nivel: 'Básico',
        progreso: 75,
        profesor: 'Hernán Pérez',
        imagen: 'assets/img/portfolio/1.png',
        proximaClase: new Date('2026-02-02')
      },
      {
        id: 2,
        titulo: 'Vida Cristiana',
        nivel: 'Básico',
        progreso: 45,
        profesor: 'Cristian Villafuerte',
        imagen: 'assets/img/portfolio/2.jpg',
        proximaClase: new Date('2026-02-02')
      },
      {
        id: 3,
        titulo: 'Métodos de Evangelismo General',
        nivel: 'Avanzado',
        progreso: 30,
        profesor: 'Eben Ezer Cayo',
        imagen: 'assets/img/portfolio/6.png',
        proximaClase: new Date('2026-02-02')
      }
    ];
  }

  verCurso(cursoId: number) {
    this.router.navigate(['/estudiante/curso', cursoId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
