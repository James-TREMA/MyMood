import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MoodService } from '../../core/services/mood.service';
import { AlertService } from '../../core/services/alert.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mood-management',
  templateUrl: './mood-management.component.html',
  styleUrls: ['./mood-management.component.css']
})
export class MoodManagementComponent implements OnInit {
  moodControl = new FormControl(50);
  isAlertClicked = false;
  isMoodStatusVisible = false;
  private statusTimeout: any;

  constructor(
    private router: Router,
    private moodService: MoodService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.moodControl.valueChanges.subscribe(value => {
      if (value !== null) {
        // Réinitialiser le timeout précédent
        if (this.statusTimeout) {
          clearTimeout(this.statusTimeout);
        }

        // Masquer le status
        this.isMoodStatusVisible = false;

        // Sauvegarder l'humeur
        this.saveMood(value);

        // Afficher le status après un court délai
        this.statusTimeout = setTimeout(() => {
          this.isMoodStatusVisible = true;
        }, 300);
      }
    });
  }

  getMoodText(): string {
    const value = this.moodControl.value;
    if (!value) return 'Je me sens mal';
    if (value >= 75) return 'Je me sens très mal';
    if (value >= 50) return 'Je me sens moyen';
    return 'Je me sens bien';
  }

  getMoodStatus(): string {
    const value = this.moodControl.value;
    if (!value) return 'Tout est OK.';
    if (value >= 75) return 'Besoin d\'aide urgente';
    if (value >= 50) return 'Ça pourrait aller mieux';
    return 'Tout est OK.';
  }

  getSliderBackground(): string {
    return `linear-gradient(to top, 
      #22c55e 0%, 
      #eab308 50%, 
      #ef4444 100%
    )`;
  }

  getThumbPosition(): string {
    const value = this.moodControl.value || 50;
    const position = 100 - value; // Inverser la position car le gradient va de bas en haut
    return `${position}%`;
  }

  async saveMood(value: number) {
    try {
      await this.moodService.create(value).toPromise();
    } catch (error) {
      console.error('Error saving mood:', error);
      this.notificationService.error('Erreur lors de l\'enregistrement de l\'humeur');
    }
  }

  async createAlert() {
    try {
      this.isAlertClicked = true;
      await this.alertService.createAlert().toPromise();
      this.notificationService.success('Alerte envoyée avec succès');
      setTimeout(() => {
        this.isAlertClicked = false;
      }, 600);
    } catch (error) {
      console.error('Error creating alert:', error);
      this.notificationService.error('Erreur lors de l\'envoi de l\'alerte');
      this.isAlertClicked = false;
    }
  }
}