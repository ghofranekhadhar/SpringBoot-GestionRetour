import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { NonConformiteService } from '../../services/non-conformite.service';
import { ProduitService } from '../../services/produit.service';
import { NonConformite } from '../../models/non-conformite.model';
import { Produit } from '../../models/produit.model';

@Component({
  selector: 'app-non-conformite-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Breadcrumb],
  template: `
    <div class="admin-page fade-in">
      <app-breadcrumb></app-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Fiches de Non-Conformité</h1>
          <p class="page-subtitle">Consultez et suivez l'état des non-conformités liées aux produits.</p>
        </div>
        <div>
          <button class="primary-btn" (click)="openAddModal()">
            <i class="ph ph-plus"></i> Nouvelle Non-Conformité
          </button>
        </div>
      </div>

      <!-- Filter & Search Container -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px; width:100%;">
        
        <!-- Ligne 1: Recherche (Taille normale) -->
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input type="text" placeholder="Rechercher incident..."
                 class="form-control" style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
                 [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
        </div>

        <!-- Ligne 2: Filtres à gauche, Tri à droite -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; width:100%;">
          <div class="stats-row" style="display:flex; gap:12px; margin:0;">
            <div class="stat-chip" [class.active]="graviteFilter==='ALL'" (click)="setGraviteFilter('ALL')">
              <i class="ph ph-warning"></i>
              <span>Toutes</span>
              <strong>{{ items.length }}</strong>
            </div>
            <div class="stat-chip" [class.active-y]="graviteFilter==='FAIBLE'" (click)="setGraviteFilter('FAIBLE')">
              <i class="ph ph-warning-circle"></i>
              <span>Faible</span>
              <strong>{{ countBy('FAIBLE') }}</strong>
            </div>
            <div class="stat-chip" [class.active-o]="graviteFilter==='MOYENNE'" (click)="setGraviteFilter('MOYENNE')">
              <i class="ph ph-warning-circle"></i>
              <span>Moyenne</span>
              <strong>{{ countBy('MOYENNE') }}</strong>
            </div>
            <div class="stat-chip" [class.active-r]="graviteFilter==='CRITIQUE'" (click)="setGraviteFilter('CRITIQUE')">
              <i class="ph ph-warning-octagon"></i>
              <span>Critique</span>
              <strong>{{ countBy('CRITIQUE') }}</strong>
            </div>
          </div>

          <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:12px 20px;">
            <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
            {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
          </button>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="widget-card">
        <div class="widget-header">
          <h3 class="widget-title">
            <i class="ph ph-warning" style="margin-right:8px;color:#ef4444;"></i>
            Liste des incidents
          </h3>
        </div>

        <div class="widget-body p-0">
          <div *ngIf="isLoading" style="padding:40px;text-align:center;color:var(--text-secondary);">
            <p style="margin-top:12px;">Chargement...</p>
          </div>

          <div *ngIf="!isLoading" class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width:80px;">ID</th>
                  <th>Produit concerné</th>
                  <th>Description</th>
                  <th style="width:120px;">Date</th>
                  <th style="width:130px;">Gravité</th>
                  <th style="width:80px;text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let nc of filteredItems" class="table-row-hover">
                  <td>
                    <span style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary);">
                      #{{ nc.id }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="prod-avatar" style="background: rgba(34,197,94,0.1); color: #22c55e;">
                        <i class="ph ph-package"></i>
                      </div>
                      <span style="font-weight:600;">{{ nc.produit.nom || 'Produit inconnu' }}</span>
                    </div>
                  </td>
                  <td class="motif-cell" [title]="nc.description">
                    {{ nc.description && nc.description.length > 40 ? (nc.description | slice:0:40) + '…' : nc.description }}
                  </td>
                  <td style="font-size:0.84rem;color:var(--text-secondary);">
                    {{ nc.date | date:'dd/MM/yyyy' }}
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getGraviteClass(nc.gravite)">
                      <i class="ph ph-warning-circle"></i>
                      {{ nc.gravite }}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <button class="action-btn" title="Modifier" (click)="openEditModal(nc)" style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:1.1rem;padding:4px;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#3b82f6'">
                      <i class="ph ph-pencil-simple"></i>
                    </button>
                  </td>
                </tr>

                <tr *ngIf="filteredItems.length === 0">
                  <td colspan="6">
                    <div class="empty-state" style="padding:50px 0;">
                      <i class="ph ph-check-square empty-icon" style="color: #4ade80;"></i>
                      <p *ngIf="searchQuery">Aucun résultat pour « {{ searchQuery }} ».</p>
                      <p *ngIf="!searchQuery">Aucune non-conformité enregistrée.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TODO: Modal ajout Non Conformité -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="widget-card">
          <div class="widget-header">
            <div>
              <h3 class="widget-title">{{ editingId ? 'Modifier la' : 'Nouvelle' }} Non-Conformité</h3>
              <p style="margin:4px 0 0;font-size:0.84rem;color:#64748b;">
                {{ editingId ? 'Mettez à jour les informations de cet incident.' : 'Signalez un défaut qualité.' }}
              </p>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#64748b;" (click)="closeAddModal()">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <div class="widget-body" style="padding:24px;">
            <div class="alert-error" *ngIf="modalError" style="margin-bottom:16px;padding:12px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:8px;">
              {{ modalError }}
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:600;display:block;margin-bottom:6px;">Produit concerné <span style="color:#ef4444">*</span></label>
              <select class="form-control" [(ngModel)]="newNc.produit" style="width:100%;padding:10px;border-radius:8px;border:1px solid #cbd5e1;" [disabled]="editingId !== null">
                <option [ngValue]="null" disabled>Sélectionnez un produit</option>
                <option *ngFor="let p of produits" [ngValue]="p">{{ p.nom }}</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-weight:600;display:block;margin-bottom:6px;">Gravité <span style="color:#ef4444">*</span></label>
              <select class="form-control" [(ngModel)]="newNc.gravite" style="width:100%;padding:10px;border-radius:8px;border:1px solid #cbd5e1;">
                <option value="FAIBLE">FAIBLE - Défaut mineur n'empêchant pas l'utilisation</option>
                <option value="MOYENNE">MOYENNE - Altération de la fonctionnalité</option>
                <option value="CRITIQUE">CRITIQUE -  Danger ou produit inutilisable</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:20px;">
              <label class="form-label" style="font-weight:600;display:block;margin-bottom:6px;">Description détaillée <span style="color:#ef4444">*</span></label>
              <textarea class="form-control modal-textarea" rows="4" [(ngModel)]="newNc.description" placeholder="Description du défaut constaté..." style="width:100%;padding:10px;border-radius:8px;border:1px solid #cbd5e1;resize:vertical;" [disabled]="editingId !== null"></textarea>
            </div>
            <div class="form-actions" style="display:flex;gap:12px;justify-content:flex-end;">
              <button class="secondary-btn" (click)="closeAddModal()" [disabled]="isSubmittingModal" style="padding:10px 16px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">Annuler</button>
              <button class="primary-btn" (click)="submitAddModal()" [disabled]="!newNc.produit || !newNc.description || isSubmittingModal" style="padding:10px 16px;border-radius:8px;background:#3b82f6;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">
                <span *ngIf="isSubmittingModal" class="spinner" style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;"></span>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prod-avatar {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem; flex-shrink: 0;
    }
    .motif-cell { color: var(--text-secondary); font-size: 0.87rem; max-width: 200px; }
    .table-row-hover { transition: background 0.2s; cursor: default; }
    .table-row-hover:hover { background: var(--border-color); }
    .badge-red { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
    .badge-orange { background: rgba(249,115,22,0.1); color: #fb923c; border: 1px solid rgba(249,115,22,0.2); }
    .badge-yellow { background: rgba(234,179,8,0.1); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }

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
    .stat-chip.active-y { background: rgba(234,179,8,0.1);  border-color: rgba(234,179,8,0.3);  color:#eab308; }
    .stat-chip.active-o { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.3); color:#fb923c; }
    .stat-chip.active-r { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3);  color:#f87171; }
  `],
  styleUrls: ['../admin-shared.css']
})
export class NonConformiteList implements OnInit {
  items: NonConformite[] = [];
  filteredItems: NonConformite[] = [];
  isLoading = true;
  searchQuery = '';
  graviteFilter = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  showAddModal = false;
  isSubmittingModal = false;
  editingId: number | null = null;
  modalError = '';
  produits: Produit[] = [];
  newNc: Partial<NonConformite> = { produit: null as any, description: '', gravite: 'MOYENNE' };

  constructor(
    private ncService: NonConformiteService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.chargerNc();
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => this.produits = data,
      error: (err) => console.error("Erreur chargement des produits", err)
    });
  }

  chargerNc(): void {
    this.isLoading = true;
    this.ncService.getNonConformites().subscribe({
      next: (data) => {
        this.items = data.sort((a,b) => (b.id || 0) - (a.id || 0)); /* desc */
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.items];
    
    if (this.graviteFilter !== 'ALL') {
      list = list.filter(r => r.gravite === this.graviteFilter);
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        (r.produit?.nom || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }
    
    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA !== dateB) {
        return this.sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      }
      return this.sortOrder === 'DESC' ? (b.id || 0) - (a.id || 0) : (a.id || 0) - (b.id || 0);
    });

    this.filteredItems = list;
  }

  setGraviteFilter(g: string): void {
    this.graviteFilter = g;
    this.applyFilters();
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.applyFilters();
  }

  countBy(g: string): number {
    return this.items.filter(nc => nc.gravite === g).length;
  }

  getGraviteClass(g: string): string {
    const grav = (g || '').toUpperCase();
    if (grav === 'CRITIQUE') return 'badge-red';
    if (grav === 'MOYENNE') return 'badge-orange';
    return 'badge-yellow';
  }

  openAddModal() {
    this.editingId = null;
    this.newNc = { produit: null as any, description: '', gravite: 'MOYENNE' };
    this.modalError = '';
    this.showAddModal = true;
  }

  openEditModal(nc: NonConformite) {
    this.editingId = nc.id || null;
    // On clone l'objet pour ne pas modifier la ligne directement
    // On retrouve aussi le produit complet dans this.produits (si nécessaire pour la sélect)
    const matchedProduct = this.produits.find(p => p.id === nc.produit?.id) || nc.produit;
    this.newNc = { ...nc, produit: matchedProduct };
    this.modalError = '';
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.editingId = null;
  }

  submitAddModal() {
    if (!this.newNc.produit || !this.newNc.description) return;
    this.isSubmittingModal = true;
    this.modalError = '';

    const payload: NonConformite = {
      description: this.newNc.description,
      gravite: this.newNc.gravite!,
      produit: this.newNc.produit as Produit
    };

    if (this.editingId) {
      this.ncService.updateNonConformite(this.editingId, payload).subscribe({
        next: () => {
          this.isSubmittingModal = false;
          this.showAddModal = false;
          this.editingId = null;
          this.chargerNc(); // Refresh
        },
        error: (err) => {
          this.isSubmittingModal = false;
          this.modalError = "Erreur lors de la modification.";
          console.error(err);
        }
      });
    } else {
      this.ncService.createNonConformite(payload).subscribe({
        next: () => {
          this.isSubmittingModal = false;
          this.showAddModal = false;
          this.chargerNc(); // Refresh
        },
        error: (err) => {
          this.isSubmittingModal = false;
          this.modalError = "Erreur lors de l'enregistrement de la non-conformité.";
          console.error(err);
        }
      });
    }
  }
}
