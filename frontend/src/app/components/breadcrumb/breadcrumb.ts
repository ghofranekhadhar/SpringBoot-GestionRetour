import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-container">
      <button class="back-btn" (click)="goBack()" title="Retour">
        <i class="ph ph-arrow-left"></i>
      </button>
      
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/admin/dashboard" class="home-icon">
            <i class="ph ph-house"></i>
          </a>
        </li>
        <li *ngFor="let breadcrumb of breadcrumbs; let last = last" class="breadcrumb-item">
          <span class="separator"><i class="ph ph-caret-right"></i></span>
          <ng-container *ngIf="!last">
            <a [routerLink]="breadcrumb.url" class="crumb-link">{{ breadcrumb.label }}</a>
          </ng-container>
          <ng-container *ngIf="last">
            <span class="crumb-current">{{ breadcrumb.label }}</span>
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
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-radius: 0;
      backdrop-filter: none;
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-btn:hover {
      background: var(--text-primary);
      color: var(--bg-admin);
      transform: translateX(-3px);
      box-shadow: 0 4px 12px rgba(255,255,255,0.2);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .home-icon {
      color: var(--text-secondary);
      font-size: 1.1rem;
      transition: color 0.2s;
    }
    .home-icon:hover { color: #f97316; }

    .separator {
      color: var(--border-color);
      font-size: 0.8rem;
      margin: 0 10px;
      display: flex;
    }

    .crumb-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .crumb-link:hover {
      color: var(--text-primary);
    }

    .crumb-current {
      color: white;
      font-weight: 600;
      background: linear-gradient(90deg, #f97316, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class Breadcrumb {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
      });
      
    // Initial load
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
  }

  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data['title'] : '';
    let path = route.routeConfig && route.routeConfig.path ? route.routeConfig.path : '';

    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: BreadcrumbItem = {
      label: label,
      url: nextUrl,
    };
    
    // Only add route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [ ...breadcrumbs, breadcrumb ] : [ ...breadcrumbs];
    if (route.firstChild) {
      // If we are not at our current path yet, there will be more children to look after
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  goBack() {
    window.history.back();
  }
}
