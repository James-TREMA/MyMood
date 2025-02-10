import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/api/alerts`;

  constructor(private http: HttpClient) {}

  createAlert(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  resolveAlert(alertId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${alertId}/resolve`, {});
  }

  getStudentAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`);
  }
}