import { Component } from '@angular/core';

interface Student {
  name: string;
  score: number;
}

@Component({
  selector: 'app-temp-group',
  templateUrl: './temp-group.component.html',
  styleUrls: ['./temp-group.component.css']
})
export class TempGroupComponent {
  groupName = 'Groupe temporaire 1';
  averageScore = 23;
  
  students: Student[] = [
    { name: 'Stagiaire 1', score: 100 },
    { name: 'Stagiaire 2', score: 10 },
    { name: 'Stagiaire 3', score: 50 }
  ];

  getScoreColor(score: number): string {
    if (score >= 75) return '#ef4444';
    if (score >= 50) return '#eab308';
    return '#22c55e';
  }
}