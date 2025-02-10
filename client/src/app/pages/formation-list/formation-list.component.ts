import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormationService } from '../../core/services/formation.service';

@Component({
  selector: 'app-formation-list',
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.css']
})
export class FormationListComponent implements OnInit {
  formations: any[] = [];

  isAdmin = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formationService: FormationService
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.role === 'admin';
    this.loadFormations();
  }

  loadFormations() {
    this.formationService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations || [];
      },
      error: (error) => {
        console.error('Error loading formations:', error);
      }
    });
  }

  onFormationClick(formation: any): void {
    this.router.navigate(['/formations', formation.id]);
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