import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriqueRetourService } from '../../services/historique-retour.service';
import { HistoriqueRetour } from '../../models/historique-retour.model';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historique-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Breadcrumb],
  template: `
    <div class="admin-page fade-in">
      <app-breadcrumb></app-breadcrumb>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Historique des Retours</h1>
          <p class="page-subtitle">Traçabilité complète de toutes les actions effectuées sur les retours produits.</p>
        </div>
        <button class="refresh-btn" (click)="charger()" [disabled]="isLoading">
          <i class="ph ph-arrows-clockwise" [class.spinning]="isLoading"></i>
          Actualiser
        </button>
      </div>

      <!-- Barre de recherche et Filtres -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
        <div style="display:flex; gap:12px; flex:1; min-width:300px; align-items:center;">
          <div style="position:relative; flex:1; max-width:420px;">
            <i class="ph ph-magnifying-glass" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;"></i>
            <input type="text" class="form-control"
              style="padding:11px 14px 11px 40px; background:var(--card-bg); border-radius:12px;"
              placeholder="Rechercher par produit, action, employé…"
              [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
          </div>

          <!-- Filtre par action -->
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="action-chip" [class.active-all]="filterAction==='ALL'" (click)="filterAction='ALL'; applyFilters()">Tous</span>
            <span class="action-chip" [class.active-create]="filterAction==='CREATION'" (click)="filterAction='CREATION'; applyFilters()">
              <i class="ph ph-plus-circle"></i> Création
            </span>
            <span class="action-chip" [class.active-valid]="filterAction==='VALIDATION'" (click)="filterAction='VALIDATION'; applyFilters()">
              <i class="ph ph-check-circle"></i> Validation
            </span>
            <span class="action-chip" [class.active-rejet]="filterAction==='REJET'" (click)="filterAction='REJET'; applyFilters()">
              <i class="ph ph-x-circle"></i> Rejet
            </span>
            <span class="action-chip" [class.active-modif]="filterAction==='MODIFICATION'" (click)="filterAction='MODIFICATION'; applyFilters()">
              <i class="ph ph-pencil"></i> Modification
            </span>
          </div>
        </div>

        <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:10px 18px; border:1px solid var(--border-color); color:var(--text-secondary); font-size:0.87rem;">
          <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
          {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
        </button>
      </div>

      <!-- Tableau -->
      <div class="widget-card">
        <div class="widget-header">
          <h3 class="widget-title">
            <i class="ph ph-clock-clockwise" style="margin-right:8px; color:#8b5cf6;"></i>
            Journal d'activité
          </h3>
          <span style="font-size:0.82rem; color:var(--text-secondary);">
            {{ filteredHistorique.length }} entrée(s)
          </span>
        </div>

        <div class="widget-body p-0">
          <!-- Loading -->
          <div *ngIf="isLoading" style="padding:50px; text-align:center; color:var(--text-secondary);">
            <i class="ph ph-circle-notch" style="font-size:2rem; animation:spin 1s linear infinite;"></i>
            <p style="margin-top:12px;">Chargement de l'historique…</p>
          </div>

          <!-- Table -->
          <div *ngIf="!isLoading" class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width:70px;">ID</th>
                  <th>Retour</th>
                  <th>Produit</th>
                  <th style="width:160px;">Action</th>
                  <th>Employé</th>
                  <th style="width:130px;">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let h of filteredHistorique" class="hist-row">
                  <td>
                    <span style="font-family:monospace; font-size:0.82rem; color:var(--text-secondary);">
                      #{{ h.id }}
                    </span>
                  </td>
                  <td>
                    <span class="retour-ref">Retour #{{ h.retour.id }}</span>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="prod-icon"><i class="ph ph-package"></i></div>
                      <span style="font-weight:600;">{{ h.retour.produit?.nom || '—' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="action-badge" [ngClass]="getActionClass(h.action)">
                      <i class="ph" [ngClass]="getActionIcon(h.action)"></i>
                      {{ getActionLabel(h.action) }}
                    </span>
                  </td>
                  <td>
                    <div *ngIf="h.employe; else noEmploye" style="display:flex; align-items:center; gap:8px;">
                      <div class="employe-avatar">{{ h.employe.nom.charAt(0).toUpperCase() }}</div>
                      <div>
                        <div style="font-weight:600; font-size:0.87rem;">{{ h.employe.nom }}</div>
                        <div style="font-size:0.76rem; color:var(--text-secondary);">{{ h.employe.email }}</div>
                      </div>
                    </div>
                    <ng-template #noEmploye>
                      <span style="color:var(--text-secondary); font-size:0.82rem;">Système</span>
                    </ng-template>
                  </td>
                  <td style="font-size:0.84rem; color:var(--text-secondary);">
                    {{ h.date | date:'dd/MM/yyyy' }}
                  </td>
                </tr>

                <tr *ngIf="filteredHistorique.length === 0">
                  <td colspan="6">
                    <div class="empty-state" style="padding:50px 0;">
                      <i class="ph ph-clock-clockwise empty-icon"></i>
                      <p>Aucune entrée d'historique trouvée.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .refresh-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 12px;
      background: var(--card-bg); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s; font-size: 0.87rem;
    }
    .refresh-btn:hover:not(:disabled) {
      border-color: #8b5cf6; color: #8b5cf6;
    }
    .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinning { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .action-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 10px;
      background: var(--card-bg); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s; font-size: 0.83rem; user-select: none;
    }
    .action-chip:hover { border-color: #8b5cf6; color: #8b5cf6; }
    .active-all    { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); color: #818cf8 !important; }
    .active-create { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.4); color: #60a5fa !important; }
    .active-valid  { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.4);  color: #4ade80 !important; }
    .active-rejet  { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.4);  color: #f87171 !important; }
    .active-modif  { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.4); color: #fb923c !important; }

    .hist-row { transition: background 0.2s; }
    .hist-row:hover { background: var(--border-color); }

    .retour-ref {
      font-family: monospace; font-size: 0.84rem;
      color: #8b5cf6; font-weight: 700;
    }
    .prod-icon {
      width: 28px; height: 28px; border-radius: 8px;
      background: rgba(249,115,22,0.1); display: flex;
      align-items: center; justify-content: center;
      color: #fb923c; font-size: 0.88rem; flex-shrink: 0;
    }
    .employe-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; display: flex; align-items: center;
      justify-content: center; font-weight: 800; font-size: 0.85rem;
      flex-shrink: 0;
    }

    .action-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 8px;
      font-size: 0.78rem; font-weight: 700;
    }
    .badge-creation   { background: rgba(59,130,246,0.12);  color: #3b82f6; }
    .badge-validation { background: rgba(34,197,94,0.12);   color: #22c55e; }
    .badge-rejet      { background: rgba(239,68,68,0.12);   color: #ef4444; }
    .badge-modif      { background: rgba(249,115,22,0.12);  color: #f97316; }
    .badge-default    { background: rgba(100,116,139,0.12); color: #64748b; }
  `],
  styleUrls: ['../admin-shared.css']
})
export class HistoriqueList implements OnInit {

  historique: HistoriqueRetour[] = [];
  filteredHistorique: HistoriqueRetour[] = [];
  isLoading = true;
  searchQuery = '';
  filterAction = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  constructor(private historiqueService: HistoriqueRetourService) {}

  ngOnInit(): void { this.charger(); }

  charger(): void {
    this.isLoading = true;
    this.historiqueService.getAll().subscribe({
      next: (data: HistoriqueRetour[]) => {
        this.historique = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement historique', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.historique];

    if (this.filterAction !== 'ALL') {
      list = list.filter(h => h.action === this.filterAction);
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(h =>
        (h.retour.produit?.nom || '').toLowerCase().includes(q) ||
        (h.action || '').toLowerCase().includes(q) ||
        (h.employe?.nom || '').toLowerCase().includes(q)
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

    this.filteredHistorique = list;
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.applyFilters();
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'CREATION':    return 'action-badge badge-creation';
      case 'VALIDATION':  return 'action-badge badge-validation';
      case 'REJET':       return 'action-badge badge-rejet';
      case 'MODIFICATION':return 'action-badge badge-modif';
      default:            return 'action-badge badge-default';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATION':    return 'ph-plus-circle';
      case 'VALIDATION':  return 'ph-check-circle';
      case 'REJET':       return 'ph-x-circle';
      case 'MODIFICATION':return 'ph-pencil';
      default:            return 'ph-activity';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'CREATION':    return 'Création';
      case 'VALIDATION':  return 'Validation';
      case 'REJET':       return 'Rejet';
      case 'MODIFICATION':return 'Modification';
      default:            return action;
    }
  }
}
