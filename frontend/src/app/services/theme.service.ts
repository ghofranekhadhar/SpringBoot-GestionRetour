import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'retourtrack_theme';
  private isLightModeSubject = new BehaviorSubject<boolean>(false);
  
  public isLightMode$ = this.isLightModeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme === 'light') {
      this.setLightTheme(true);
    } else {
      this.setLightTheme(false);
    }
  }

  public toggleTheme() {
    this.setLightTheme(!this.isLightModeSubject.value);
  }

  private setLightTheme(isLight: boolean) {
    this.isLightModeSubject.next(isLight);
    
    if (isLight) {
      this.document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(this.THEME_KEY, 'light');
    } else {
      // Remover attribute reverts to default dark mode (root variables)
      this.document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(this.THEME_KEY, 'dark');
    }
  }

  public get isLightMode(): boolean {
    return this.isLightModeSubject.value;
  }
}
