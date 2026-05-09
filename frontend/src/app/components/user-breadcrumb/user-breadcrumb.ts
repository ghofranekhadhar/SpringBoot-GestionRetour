import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-user-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-container">
      <button class="back-btn" (click)="goBack()" title="Retour">
        <i class="ph ph-arrow-left"></i>
      </button>

      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/user/dashboard" class="home-icon" title="Tableau de bord">
            <i class="ph ph-house"></i>
          </a>
        </li>
        <li *ngFor="let crumb of breadcrumbs; let last = last" class="breadcrumb-item">
          <span class="separator"><i class="ph ph-caret-right"></i></span>
          <ng-container *ngIf="!last">
            <a [routerLink]="crumb.url" class="crumb-link">{{ crumb.label }}</a>
          </ng-container>
          <ng-container *ngIf="last">
            <span class="crumb-current">{{ crumb.label }}</span>
          </ng-container>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 10px 18px;
    }

    .back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 50%;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 1rem; cursor: pointer;
      transition: all 0.2s ease;
    }
    .back-btn:hover {
      background: #3b82f6; color: white;
      border-color: #3b82f6;
      transform: translateX(-3px);
    }

    .breadcrumb {
      display: flex; align-items: center;
      list-style: none; margin: 0; padding: 0;
      font-size: 0.88rem; font-weight: 500;
      font-family: 'Inter', sans-serif;
    }
    .breadcrumb-item { display: flex; align-items: center; }

    .home-icon { color: var(--text-secondary); font-size: 1.05rem; transition: color 0.2s; }
    .home-icon:hover { color: #3b82f6; }

    .separator { color: var(--border-color); font-size: 0.75rem; margin: 0 10px; display: flex; }

    .crumb-link { color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
    .crumb-link:hover { color: var(--text-primary); }

    .crumb-current {
      font-weight: 700;
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class UserBreadcrumb implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  private readonly routeLabels: Record<string, string> = {
    'user':           'Espace Employé',
    'dashboard':      'Tableau de bord',
    'produits':       'Catalogue Produits',
    'mes-retours':    'Mes Retours',
    'nouveau-retour': 'Nouveau Retour',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFromUrl(this.router.url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.buildFromUrl(e.urlAfterRedirects));
  }

  buildFromUrl(url: string): void {
    const segments = url.split('?')[0].split('/').filter(Boolean);
    this.breadcrumbs = [];
    let accumulated = '';
    for (const seg of segments) {
      accumulated += '/' + seg;
      const label = this.routeLabels[seg];
      if (label) {
        this.breadcrumbs.push({ label, url: accumulated });
      }
    }
    // Remove the first segment (espace employé home = /user) as it's covered by the house icon
    if (this.breadcrumbs.length > 0 && this.breadcrumbs[0].url === '/user') {
      this.breadcrumbs.shift();
    }
  }

  goBack(): void { window.history.back(); }
}
