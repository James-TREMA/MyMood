import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormationService, Formation } from '../../core/services/formation.service';
import { AlertService } from '../../core/services/alert.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-supervisor-dashboard',
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.css']
})
export class SupervisorDashboardComponent implements OnInit {
  formations: Formation[] = [];
  alerts: any[] = [];
  loading = {
    formations: false,
    alerts: false
  };

  trackByFn(index: number, formation: Formation): number {
    return formation.id;
  }

  constructor(
    private router: Router,
    private formationService: FormationService,
    private alertService: AlertService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadFormations();
    this.loadAlerts();
  }

  loadFormations() {
    this.loading.formations = true;
    this.formationService.getFormations().subscribe({
      next: (formations: Formation[]) => {
        console.log('Formations loaded:', formations);
        this.formations = formations;
        this.loading.formations = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.notificationService.error('Erreur lors du chargement des formations');
        this.loading.formations = false;
      }
    });
  }

  loadAlerts() {
    this.loading.alerts = true;
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.loading.alerts = false;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
        this.notificationService.error('Erreur lors du chargement des alertes');
        this.loading.alerts = false;
      }
    });
  }

  onFormationClick(formation: Formation) {
    if (!formation || !formation.id) return;
    this.router.navigate(['/formations', formation.id]);
  }

  resolveAlert(alertId: number, event: Event) {
    event.stopPropagation(); // Empêcher la propagation du clic
    this.alertService.resolveAlert(alertId).subscribe({
      next: () => {
        this.loadAlerts();
        this.notificationService.success('Alerte résolue avec succès');
      },
      error: (error) => {
        console.error('Error resolving alert:', error);
        this.notificationService.error('Erreur lors de la résolution de l\'alerte');
      }
    });
  }

  getMoodColor(mood: number): string {
    if (mood >= 75) return '#ef4444';
    if (mood >= 50) return '#eab308';
    return '#22c55e';
  }
}