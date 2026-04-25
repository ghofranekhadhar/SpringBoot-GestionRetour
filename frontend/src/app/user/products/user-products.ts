import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import { Produit } from '../../models/produit.model';
import { UserBreadcrumb } from '../../components/user-breadcrumb/user-breadcrumb';

@Component({
  selector: 'app-user-products',
  standalone: true,
  imports: [CommonModule, FormsModule, UserBreadcrumb],
  template: `
    <div class="user-page fade-in">
      <app-user-breadcrumb></app-user-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Catalogue Produits</h1>
          <p class="page-subtitle">Consultez les produits disponibles et leurs informations.</p>
        </div>
      </div>

      <!-- Search Container -->
      <div style="margin-bottom: 16px;">
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input
            type="text"
            class="form-control"
            style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
            placeholder="Rechercher un produit..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
          />
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <span class="stat-item">
          <i class="ph ph-package"></i>
          <strong>{{ produits.length }}</strong> produits au total
        </span>
        <span class="stat-item">
          <i class="ph ph-check-circle" style="color:#4ade80;"></i>
          <strong>{{ inStockCount }}</strong> en stock
        </span>
        <span class="stat-item">
          <i class="ph ph-x-circle" style="color:#f87171;"></i>
          <strong>{{ outOfStockCount }}</strong> rupture de stock
        </span>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-grid">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!isLoading && filteredProduits.length > 0" class="products-grid">
        <div *ngFor="let p of filteredProduits" class="product-card">
          <div class="product-card-icon">
            <i class="ph ph-package"></i>
          </div>
          <h4 class="product-name">{{ p.nom }}</h4>
          <p class="product-desc">{{ p.description || 'Aucune description disponible.' }}</p>
          <div class="product-meta">
            <span class="product-price">{{ p.prix | currency:'EUR':'symbol':'1.2-2' }}</span>
            <span class="product-stock"
              [ngClass]="(p.quantiteEnStock || 0) > 0 ? 'badge badge-green' : 'badge badge-red'">
              <i class="ph" [ngClass]="(p.quantiteEnStock || 0) > 0 ? 'ph-check' : 'ph-x'"></i>
              {{ (p.quantiteEnStock || 0) > 0 ? p.quantiteEnStock + ' en stock' : 'Épuisé' }}
            </span>
          </div>
          <div class="product-footer">
            <span class="product-date" *ngIf="p.dateAjout">
              <i class="ph ph-calendar-blank"></i>
              Ajouté le {{ p.dateAjout | date:'dd/MM/yyyy' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && filteredProduits.length === 0" class="widget-card">
        <div class="empty-state">
          <i class="ph ph-magnifying-glass empty-icon"></i>
          <h4>Aucun produit trouvé</h4>
          <p>{{ searchQuery ? 'Aucun résultat pour « ' + searchQuery + ' ».' : 'Le catalogue est vide pour le moment.' }}</p>
          <button *ngIf="searchQuery" class="secondary-btn" (click)="clearSearch()">
            <i class="ph ph-x"></i> Effacer la recherche
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Stats bar */
    .stats-bar {
      display: flex; align-items: center; gap: 24px;
      padding: 14px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px; margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .stat-item {
      display: flex; align-items: center; gap: 7px;
      font-size: 0.88rem; color: var(--text-secondary);
    }
    .stat-item i { font-size: 1rem; }
    .stat-item strong { color: var(--text-primary); font-weight: 700; }

    /* Skeletons */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }
    .skeleton-card {
      height: 220px; border-radius: 16px;
      background: linear-gradient(90deg, var(--card-bg) 25%, rgba(255,255,255,0.04) 50%, var(--card-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Product card extras */
    .product-footer {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }
    .product-date {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.76rem; color: var(--text-secondary);
    }
    .product-date i { font-size: 0.85rem; }
  `],
  styleUrls: ['../user-shared.css']
})
export class UserProducts implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  searchQuery = '';
  isLoading = true;
  inStockCount = 0;
  outOfStockCount = 0;

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.filteredProduits = data;
        this.inStockCount    = data.filter(p => (p.quantiteEnStock || 0) > 0).length;
        this.outOfStockCount = data.filter(p => (p.quantiteEnStock || 0) === 0).length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredProduits = this.produits;
    } else {
      this.filteredProduits = this.produits.filter(p =>
        p.nom.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredProduits = this.produits;
  }
}
