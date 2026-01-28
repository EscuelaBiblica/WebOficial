import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserModel, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: UserModel[] = [];
  usuariosFiltrados: UserModel[] = [];
  loading = true;
  
  // Filtros
  searchTerm = '';
  filterRole: UserRole | 'todos' = 'todos';
  filterStatus: 'todos' | 'activos' | 'inactivos' = 'todos';

  // Usuario seleccionado para editar
  selectedUser: UserModel | null = null;
  showEditModal = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Convertir Timestamps de Firebase a Date
        this.usuarios = users.map(user => ({
          ...user,
          fechaRegistro: user.fechaRegistro instanceof Date 
            ? user.fechaRegistro 
            : (user.fechaRegistro as any).toDate()
        })).sort((a, b) => 
          new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.usuariosFiltrados = this.usuarios.filter(user => {
      // Filtro de búsqueda
      const searchMatch = !this.searchTerm || 
        user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de rol
      const roleMatch = this.filterRole === 'todos' || user.rol === this.filterRole;

      // Filtro de estado
      const statusMatch = this.filterStatus === 'todos' || 
        (this.filterStatus === 'activos' && user.activo) ||
        (this.filterStatus === 'inactivos' && !user.activo);

      return searchMatch && roleMatch && statusMatch;
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    const classes: { [key in UserRole]: string } = {
      'admin': 'bg-danger',
      'profesor': 'bg-success',
      'estudiante': 'bg-primary'
    };
    return classes[role];
  }

  getRoleLabel(role: UserRole): string {
    const labels: { [key in UserRole]: string } = {
      'admin': 'Administrador',
      'profesor': 'Profesor',
      'estudiante': 'Estudiante'
    };
    return labels[role];
  }

  async changeRole(user: UserModel, newRole: UserRole) {
    if (confirm(`¿Cambiar rol de ${user.nombre} ${user.apellido} a ${this.getRoleLabel(newRole)}?`)) {
      try {
        await this.userService.changeUserRole(user.id, newRole);
      } catch (error) {
        console.error('Error cambiando rol:', error);
        alert('Error al cambiar el rol');
      }
    }
  }

  async toggleStatus(user: UserModel) {
    const action = user.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro de ${action} a ${user.nombre} ${user.apellido}?`)) {
      try {
        await this.userService.toggleUserStatus(user.id, !user.activo);
      } catch (error) {
        console.error('Error cambiando estado:', error);
        alert('Error al cambiar el estado');
      }
    }
  }

  editUser(user: UserModel) {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  async saveUser() {
    if (!this.selectedUser) return;

    try {
      await this.userService.updateUser(this.selectedUser.id, {
        nombre: this.selectedUser.nombre,
        apellido: this.selectedUser.apellido,
        email: this.selectedUser.email,
        rol: this.selectedUser.rol
      });
      this.closeEditModal();
      alert('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar usuario');
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
