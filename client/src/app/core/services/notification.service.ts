import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'left',
    verticalPosition: 'top',
    panelClass: ['notification-container']
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string) {
    this.snackBar.open(message, 'Fermer', {
      ...this.config,
      panelClass: ['success-snackbar']
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'Fermer', {
      ...this.config,
      panelClass: ['error-snackbar']
    });
  }
}