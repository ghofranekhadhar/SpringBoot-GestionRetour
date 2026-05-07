import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NonConformite } from '../models/non-conformite.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NonConformiteService {
  private apiUrl = `${environment.apiUrl}/non-conformites`;

  constructor(private http: HttpClient) {}

  getNonConformites(): Observable<NonConformite[]> {
    return this.http.get<NonConformite[]>(this.apiUrl);
  }

  getNonConformiteById(id: number): Observable<NonConformite> {
    return this.http.get<NonConformite>(`${this.apiUrl}/${id}`);
  }

  getNonConformitesByProduitId(produitId: number): Observable<NonConformite[]> {
    return this.http.get<NonConformite[]>(`${this.apiUrl}/produit/${produitId}`);
  }

  createNonConformite(nc: NonConformite): Observable<NonConformite> {
    return this.http.post<NonConformite>(this.apiUrl, nc);
  }

  updateNonConformite(id: number, nc: NonConformite): Observable<NonConformite> {
    return this.http.put<NonConformite>(`${this.apiUrl}/${id}`, nc);
  }

  deleteNonConformite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
