import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RetourProduit } from '../models/retour.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RetourService {
  private apiUrl = `${environment.apiUrl}/retours`;

  constructor(private http: HttpClient) {}

  getRetours(): Observable<RetourProduit[]> {
    return this.http.get<RetourProduit[]>(this.apiUrl);
  }

  getMyRetours(): Observable<RetourProduit[]> {
    return this.http.get<RetourProduit[]>(`${this.apiUrl}/me`);
  }

  getRetourById(id: number): Observable<RetourProduit> {
    return this.http.get<RetourProduit>(`${this.apiUrl}/${id}`);
  }

  createRetour(retour: RetourProduit, employeId: number): Observable<RetourProduit> {
    return this.http.post<RetourProduit>(`${this.apiUrl}?employeId=${employeId}`, retour);
  }

  updateRetour(id: number, retour: RetourProduit): Observable<RetourProduit> {
    return this.http.put<RetourProduit>(`${this.apiUrl}/${id}`, retour);
  }

  validerRetour(id: number, employeId: number): Observable<RetourProduit> {
    return this.http.put<RetourProduit>(`${this.apiUrl}/${id}/valider?employeId=${employeId}`, {});
  }

  rejeterRetour(id: number, employeId: number): Observable<RetourProduit> {
    return this.http.put<RetourProduit>(`${this.apiUrl}/${id}/rejeter?employeId=${employeId}`, {});
  }
}
