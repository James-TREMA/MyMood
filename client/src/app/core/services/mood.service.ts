import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private apiUrl = `${environment.apiUrl}/api/moods`;

  constructor(private http: HttpClient) {}

  create(score: number): Observable<any> {
    return this.http.post(this.apiUrl, { score });
  }

  getUserScores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`);
  }

  getMoodHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}