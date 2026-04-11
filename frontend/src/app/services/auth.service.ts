import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  id: number;
  nom: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = `${environment.apiUrl}/auth/login`;

  private _currentUserValue: AuthResponse | null = null;
  public currentUser$: BehaviorSubject<AuthResponse | null> = new BehaviorSubject<AuthResponse | null>(null);

  constructor(private http: HttpClient) { 
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUserValue = user;
        this.currentUser$.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<any>(this.url, { email, password }).pipe(
      map(response => {
        if (response && response.token) {
          const normalized: AuthResponse = {
            token: response.token,
            id: response.user?.id,
            nom: response.user?.nom,
            email: response.user?.email,
            role: response.user?.role
          };
          localStorage.setItem('currentUser', JSON.stringify(normalized));
          this._currentUserValue = normalized;
          this.currentUser$.next(normalized);
          return normalized;
        }
        return response;
      })
    );
  }

  register(nom: string, email: string, password: string): Observable<AuthResponse> {
    const registerUrl = `${environment.apiUrl}/auth/register`;
    return this.http.post<any>(registerUrl, { nom, email, password }).pipe(
      map(response => {
        if (response && response.token) {
          const normalized: AuthResponse = {
            token: response.token,
            id: response.user?.id,
            nom: response.user?.nom,
            email: response.user?.email,
            role: response.user?.role
          };
          localStorage.setItem('currentUser', JSON.stringify(normalized));
          this._currentUserValue = normalized;
          this.currentUser$.next(normalized);
          return normalized;
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this._currentUserValue = null;
    this.currentUser$.next(null);
  }

  get currentUser(): AuthResponse | null {
    return this._currentUserValue;
  }

  get token(): string | null {
    return this._currentUserValue?.token || null;
  }
}
