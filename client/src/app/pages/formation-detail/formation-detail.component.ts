import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

import { ActivatedRoute } from '@angular/router';
import { FormationService } from '../../core/services/formation.service';
import { StudentService } from '../../core/services/student.service';

import { Formation } from '../../core/services/formation.service';

@Component({
  selector: 'app-formation-detail',
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.css']
})
export class FormationDetailComponent {
  formationId!: number;
  formationName = '';
  students: { name: string; last_mood: number }[] = [];
  averageMood: number = 0;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private formationService: FormationService,
    private notificationService: NotificationService
  ) {
    this.route.params.subscribe(params => {
      this.formationId = +params['id'];
      this.loadFormationDetails();
    });
  }

  loadFormationDetails() {
    console.log('Loading formation details for ID:', this.formationId);
    this.formationService.getFormation(this.formationId).subscribe({
      next: (data: any) => {
        console.log('Formation data received:', data);
        this.formationName = data.name;
        this.students = data.students;
        this.averageMood = data.averageMood;
        console.log('Processed students:', this.students);
        console.log('Average mood:', this.averageMood);
      },
      error: (error) => {
        console.error('Error loading formation:', error);
        this.notificationService.error('Erreur lors du chargement des données de la formation');
      }
    });
  }

  getMoodColor(mood: number): string {
    if (mood >= 75) return '#ef4444';  // Rouge pour les scores élevés
    if (mood >= 50) return '#eab308';  // Jaune pour les scores moyens
    return '#22c55e';                  // Vert pour les scores bas
  }

  onBackClick(): void {
    this.router.navigate(['/formations']);
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}