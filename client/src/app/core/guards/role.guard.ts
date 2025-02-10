import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!user || !requiredRoles.includes(user.role)) {
      this.redirectBasedOnRole(user?.role);
      return false;
    }

    // Redirection spéciale pour les superviseurs
    if (user.role === 'supervisor' && route.routeConfig?.path === 'formations') {
      this.router.navigate(['/supervisor']);
      return false;
    }

    return true;
  }

  private redirectBasedOnRole(role?: string): void {
    switch (role) {
      case 'supervisor':
        this.router.navigate(['/supervisor']);
        break;
      case 'student':
        this.router.navigate(['/mood']);
        break;
      case 'admin':
        this.router.navigate(['/formations']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}