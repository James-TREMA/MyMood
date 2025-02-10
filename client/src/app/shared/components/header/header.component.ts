import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() showBackButton = false;
  isAuthenticated = false;
  isAdmin = false;
  isSupervisor = false;
  isStudent = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAuthenticated = !!user;
    this.isAdmin = user.role === 'admin';
    this.isSupervisor = user.role === 'supervisor';
    this.isStudent = user.role === 'student';
  }

  onBackClick(): void {
    this.router.navigate(['/formations']);
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onAdminClick(): void {
    this.router.navigate(['/formation-management']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}