import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  last_mood: number | null;
  cohortAssignments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    // Ajout des relations pour récupérer les assignations et l'humeur
    return this.http.get<Student[]>(`${this.apiUrl}?include=cohortAssignments,last_mood`);
  }

  createStudent(studentData: { name: string; email: string; password: string; role: string }): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, studentData);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}