import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Produit } from '../models/produit.model';
import { RetourProduit } from '../models/retour-produit.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.url}/produits`);
  }

  getRetours(): Observable<RetourProduit[]> {
    return this.http.get<RetourProduit[]>(`${this.url}/retours`);
  }

  createRetour(retour: Omit<RetourProduit, 'id' | 'dateRetour' | 'statut'>): Observable<RetourProduit> {
    return this.http.post<RetourProduit>(`${this.url}/retours`, retour);
  }

  validerRetour(id: number, employeId: number): Observable<RetourProduit> {
    return this.http.put<RetourProduit>(`${this.url}/retours/${id}/valider?employeId=${employeId}`, {});
  }
}
