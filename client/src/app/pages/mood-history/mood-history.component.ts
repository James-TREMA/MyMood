import { Component, OnInit } from '@angular/core';
import { MoodService } from '../../core/services/mood.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-mood-history',
  templateUrl: './mood-history.component.html',
  styleUrls: ['./mood-history.component.css']
})
export class MoodHistoryComponent implements OnInit {
  moodHistory: any[] = [];
  filteredHistory: any[] = [];
  loading = false;
  searchTerm = '';
  selectedDateFilter = 'all';

  constructor(
    private moodService: MoodService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadMoodHistory();
  }

  loadMoodHistory() {
    this.loading = true;
    this.moodService.getMoodHistory().subscribe({
      next: (history: any[]) => {
        this.moodHistory = history;
        this.filteredHistory = history;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading mood history:', error);
        this.notificationService.error('Erreur lors du chargement de l\'historique');
        this.loading = false;
      }
    });
  }

  filterByDate(event: any) {
    this.selectedDateFilter = event.target.value;
    this.filterHistory();
  }

  filterHistory() {
    let filtered = [...this.moodHistory];

    // Filtre par date
    const now = new Date();
    switch (this.selectedDateFilter) {
      case 'today':
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.changed_at);
          return entryDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(entry => new Date(entry.changed_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(entry => new Date(entry.changed_at) >= monthAgo);
        break;
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.user.name.toLowerCase().includes(search)
      );
    }

    this.filteredHistory = filtered;
  }

  getMoodColor(mood: number): string {
    if (mood >= 75) return '#ef4444';
    if (mood >= 50) return '#eab308';
    return '#22c55e';
  }

  getMoodChange(previousScore: number, newScore: number): string {
    const difference = newScore - previousScore;
    return difference > 0 ? `+${difference}` : `${difference}`;
  }

  getMoodChangeColor(previousScore: number, newScore: number): string {
    const difference = newScore - previousScore;
    return difference > 0 ? '#ef4444' : '#22c55e';
  }

  isSevereChange(previousScore: number, newScore: number): boolean {
    return Math.abs(newScore - previousScore) >= 30;
  }
}