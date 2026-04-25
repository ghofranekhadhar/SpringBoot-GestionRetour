import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ProduitService } from '../../../services/produit.service';
import { Produit } from '../../../models/produit.model';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Breadcrumb, ProductForm],
  template: `
    <div class="admin-page fade-in">
      <app-breadcrumb></app-breadcrumb>
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Produits</h1>
          <p class="page-subtitle">Liste complète de vos produits synchronisée via API.</p>
        </div>
        <button (click)="openModal()" class="primary-btn">
          <i class="ph ph-plus"></i>
          Ajouter un Produit
        </button>
      </div>

      <!-- Filter & Search Container -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px; width:100%;">
        
        <!-- Ligne 1: Recherche (Taille normale) -->
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input type="text" placeholder="Rechercher produit..."
                 class="form-control" style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
                 [(ngModel)]="searchTerm" />
        </div>

        <!-- Ligne 2: Filtres à gauche, Tri à droite -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; width:100%;">
          <div class="stats-row" style="display:flex; gap:12px; margin:0;">
            <div class="stat-chip" [class.active]="statusFilter==='ALL'" (click)="setStatusFilter('ALL')">
              <i class="ph ph-package"></i>
              <span>Tous</span>
              <strong>{{ produits.length }}</strong>
            </div>
            <div class="stat-chip" [class.active-g]="statusFilter==='EN_STOCK'" (click)="setStatusFilter('EN_STOCK')">
              <i class="ph ph-check-circle"></i>
              <span>En Stock</span>
              <strong>{{ countBy('EN_STOCK') }}</strong>
            </div>
            <div class="stat-chip" [class.active-o]="statusFilter==='STOCK_FAIBLE'" (click)="setStatusFilter('STOCK_FAIBLE')">
              <i class="ph ph-warning-circle"></i>
              <span>Stock Faible</span>
              <strong>{{ countBy('STOCK_FAIBLE') }}</strong>
            </div>
            <div class="stat-chip" [class.active-r]="statusFilter==='RUPTURE'" (click)="setStatusFilter('RUPTURE')">
              <i class="ph ph-x-circle"></i>
              <span>Rupture</span>
              <strong>{{ countBy('RUPTURE') }}</strong>
            </div>
          </div>

          <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:12px 20px;">
            <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
            {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
          </button>
        </div>
      </div>

      <div class="widget-card">
        <div class="widget-header">
          <h3 class="widget-title">Tous les produits</h3>
        </div>
        
        <div class="widget-body p-0">
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom du Produit</th>
                  <th>Description</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th style="width: 100px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of filteredProduits">
                  <td style="font-family: monospace; color: var(--text-secondary);">#PRD-{{ p.id }}</td>
                  <td style="font-weight: 600;">{{ p.nom }}</td>
                  <td>{{ (p.description && p.description.length > 30) ? (p.description | slice:0:30) + '...' : p.description }}</td>
                  <td>{{ p.prix }} €</td>
                  <td>{{ p.quantiteEnStock || 0 }}</td>
                  <td>
                    <span class="badge" [ngClass]="(p.quantiteEnStock || 0) > 10 ? 'badge-green' : ((p.quantiteEnStock || 0) > 0 ? 'badge-orange' : 'badge-red')">
                      {{ (p.quantiteEnStock || 0) > 10 ? 'En Stock' : ((p.quantiteEnStock || 0) > 0 ? 'Stock Faible' : 'Rupture') }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button class="action-btn" title="Modifier" (click)="openModal(p)"><i class="ph ph-pencil-simple"></i></button>
                      <button class="action-btn delete" title="Supprimer" (click)="supprimerProduit(p.id!)"><i class="ph ph-trash"></i></button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State Example if array is empty -->
                <tr *ngIf="filteredProduits.length === 0 && !isLoading">
                  <td colspan="7">
                    <div class="empty-state" style="padding: 40px 0;">
                      <i class="ph ph-package empty-icon"></i>
                      <p>Aucun produit trouvé. Vous pouvez en ajouter un nouveau.</p>
                      <a routerLink="/admin/products/add" class="primary-btn" style="margin-top: 16px;">
                        Ajouter un produit
                      </a>
                    </div>
                  </td>
                </tr>
                
                <tr *ngIf="isLoading">
                   <td colspan="7" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                     Chargement des produits depuis le serveur...
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <app-product-form 
      *ngIf="showAddModal" 
      [productToEdit]="selectedProduit"
      (close)="fermerModal()" 
      (saved)="onProduitSauvegarde()">
    </app-product-form>
  `,
  styles: [`
    .stats-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 24px; flex-wrap: wrap;
    }
    .stat-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 12px;
      background: var(--card-bg); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s; font-size: 0.87rem; user-select: none;
      white-space: nowrap;
    }
    .stat-chip:hover { border-color: #94a3b8; color: var(--text-primary); }
    .stat-chip strong { margin-left:4px; font-size:1rem; font-weight:800; }
    .stat-chip.active   { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color:#60a5fa; }
    .stat-chip.active-g { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color:#4ade80; }
    .stat-chip.active-o { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.3); color:#fb923c; }
    .stat-chip.active-r { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3);  color:#f87171; }
  `],
  styleUrls: ['../../admin-shared.css']
})
export class ProductsList implements OnInit {
  produits: Produit[] = [];
  isLoading = true;
  showAddModal = false;
  selectedProduit: Produit | null = null;
  searchTerm = '';
  statusFilter = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  constructor(private produitService: ProduitService) {}

  get filteredProduits(): Produit[] {
    let list = this.produits;
    
    if (this.statusFilter !== 'ALL') {
      list = list.filter(p => {
        const q = p.quantiteEnStock || 0;
        if (this.statusFilter === 'EN_STOCK') return q > 10;
        if (this.statusFilter === 'STOCK_FAIBLE') return q > 0 && q <= 10;
        if (this.statusFilter === 'RUPTURE') return q === 0;
        return true;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(p => 
        p.nom.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    return [...list].sort((a, b) => {
      const dA = a.id || 0;
      const dB = b.id || 0;
      return this.sortOrder === 'DESC' ? (dB - dA) : (dA - dB);
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
  }

  countBy(status: string): number {
    return this.produits.filter(p => {
      const q = p.quantiteEnStock || 0;
      if (status === 'EN_STOCK') return q > 10;
      if (status === 'STOCK_FAIBLE') return q > 0 && q <= 10;
      if (status === 'RUPTURE') return q === 0;
      return true;
    }).length;
  }

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.isLoading = true;
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement', err);
        this.isLoading = false;
      }
    });
  }

  supprimerProduit(id: number): void {
    if(confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          this.chargerProduits();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }

  openModal(produit?: Produit): void {
    this.selectedProduit = produit || null;
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
  }

  fermerModal(): void {
    this.showAddModal = false;
    this.selectedProduit = null;
    document.body.style.overflow = 'auto';
  }

  onProduitSauvegarde(): void {
    this.chargerProduits();
  }
}
