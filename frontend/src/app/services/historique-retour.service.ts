import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriqueRetour } from '../models/historique-retour.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoriqueRetourService {

  private apiUrl = `${environment.apiUrl}/historique-retours`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<HistoriqueRetour[]> {
    return this.http.get<HistoriqueRetour[]>(this.apiUrl);
  }

  getById(id: number): Observable<HistoriqueRetour> {
    return this.http.get<HistoriqueRetour>(`${this.apiUrl}/${id}`);
  }

  getByRetour(retourId: number): Observable<HistoriqueRetour[]> {
    return this.http.get<HistoriqueRetour[]>(`${this.apiUrl}/retour/${retourId}`);
  }

  getByEmploye(employeId: number): Observable<HistoriqueRetour[]> {
    return this.http.get<HistoriqueRetour[]>(`${this.apiUrl}/employe/${employeId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
