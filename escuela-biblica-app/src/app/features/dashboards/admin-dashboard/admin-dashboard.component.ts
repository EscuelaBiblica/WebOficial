import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  userName: string = '';
  stats = {
    totalUsuarios: 0,
    totalCursos: 0,
    totalEstudiantes: 0,
    totalProfesores: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.nombre + ' ' + profile.apellido;
        this.cargarEstadisticas();
      }
    });
  }

  cargarEstadisticas() {
    // Datos de ejemplo - En producción esto vendría de Firestore
    this.stats = {
      totalUsuarios: 35,
      totalCursos: 10,
      totalEstudiantes: 27,
      totalProfesores: 8
    };
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
