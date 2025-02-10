import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Formation {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  assignments: Assignment[];
  averageMood?: number;
}

export interface Assignment {
  id: number;
  user: {
    id: number;
    name: string;
    last_mood: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/api/cohorts`;

  constructor(private http: HttpClient) {}

  getFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getFormation(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createFormation(name: string): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, { name });
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignStudent(formationId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${formationId}/assign`, { userId: studentId });
  }

  removeStudent(formationId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${formationId}/assignments/${studentId}`);
  }
}