import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RetourService } from '../../services/retour.service';
import { AuthService } from '../../services/auth.service';
import { ProduitService } from '../../services/produit.service';
import { RetourProduit } from '../../models/retour.model';
import { Produit } from '../../models/produit.model';
import { UserBreadcrumb } from '../../components/user-breadcrumb/user-breadcrumb';

@Component({
  selector: 'app-user-retours',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserBreadcrumb],
  template: `
    <div class="user-page fade-in">
      <app-user-breadcrumb></app-user-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ userRole === 'EMPLOYE' ? 'Gestion des Retours' : 'Mes Retours' }}</h1>
          <p class="page-subtitle">{{ userRole === 'EMPLOYE' ? "Visualisez et modifiez l'ensemble des retours du système." : "Consultez et suivez l'état de toutes vos demandes de retour." }}</p>
        </div>
        <a routerLink="/user/nouveau-retour" class="primary-btn">
          <i class="ph ph-plus-circle"></i>
          Nouveau Retour
        </a>
      </div>

      <!-- Filter & Search Container -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px; width:100%;">
        
        <!-- Ligne 1: Recherche (Taille normale) -->
        <div class="search-box" style="position:relative; width:400px; max-width:100%;">
          <i class="ph ph-magnifying-glass" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:1.1rem;"></i>
          <input type="text" placeholder="Rechercher produit, motif…"
                 class="form-control" style="width:100%; padding:12px 16px 12px 44px; margin:0; background:var(--card-bg); border-radius:12px;"
                 [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" />
        </div>

        <!-- Ligne 2: Filtres à gauche, Tri à droite -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; width:100%;">
          <div class="stats-row" style="display:flex; gap:12px; margin:0;">
            <div class="stat-chip" [class.active]="activeFilter === 'ALL'" (click)="setFilter('ALL')">
              <i class="ph ph-list-numbers"></i>
              <span>Tous</span>
              <strong>{{ retours.length }}</strong>
            </div>
            <div class="stat-chip" [class.active-w]="activeFilter === 'PENDING'" (click)="setFilter('PENDING')">
              <i class="ph ph-hourglass"></i>
              <span>En attente</span>
              <strong>{{ countByStatus('EN_ATTENTE') }}</strong>
            </div>
            <div class="stat-chip" [class.active-s]="activeFilter === 'VALID'" (click)="setFilter('VALID')">
              <i class="ph ph-check-circle"></i>
              <span>Validés</span>
              <strong>{{ countByStatus('VALIDE') }}</strong>
            </div>
            <div class="stat-chip" [class.active-d]="activeFilter === 'REJECT'" (click)="setFilter('REJECT')">
              <i class="ph ph-x-circle"></i>
              <span>Rejetés</span>
              <strong>{{ countByStatus('REJETE') }}</strong>
            </div>
          </div>

          <button class="form-control" (click)="toggleSort()" style="margin:0; cursor:pointer; width:auto; display:flex; align-items:center; gap:8px; background:var(--card-bg); border-radius:12px; padding:12px 20px;">
            <i class="ph" [ngClass]="sortOrder === 'DESC' ? 'ph-sort-descending' : 'ph-sort-ascending'"></i>
            {{ sortOrder === 'DESC' ? 'Récents' : 'Anciens' }}
          </button>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="isLoading" class="widget-card">
        <div style="padding:24px;">
          <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && filteredRetours.length === 0" class="widget-card">
        <div class="empty-state">
          <i class="ph ph-arrow-u-up-left empty-icon"></i>
          <h4>Aucun retour trouvé</h4>
          <p *ngIf="searchQuery">Aucun résultat pour « {{ searchQuery }} ».</p>
          <p *ngIf="!searchQuery">Vous n'avez pas encore créé de retour.</p>
          <a routerLink="/user/nouveau-retour" class="primary-btn" *ngIf="!searchQuery">
            <i class="ph ph-plus"></i> Créer mon premier retour
          </a>
        </div>
      </div>

      <!-- Retours Table -->
      <div *ngIf="!isLoading && filteredRetours.length > 0" class="widget-card">
        <div class="table-container">
          <table class="user-table">
            <thead>
              <tr>
                <th style="width:50px;">#</th>
                <th *ngIf="userRole === 'EMPLOYE'">Client</th>
                <th>Produit</th>
                <th>Motif</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filteredRetours; let i = index" class="retour-row" (click)="openDetail(r)">
                <td style="color:var(--text-secondary);font-size:0.82rem;">{{ r.id || i+1 }}</td>
                <td *ngIf="userRole === 'EMPLOYE'">
                  <div style="font-weight:500;">{{ r.client?.nom || 'Client inconnu' }}</div>
                  <div style="font-size:0.75rem;color:#94a3b8;">{{ r.client?.email }}</div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div class="prod-icon"><i class="ph ph-package"></i></div>
                    <span style="font-weight:600;">{{ r.produit?.nom || 'Produit inconnu' }}</span>
                  </div>
                </td>
                <td class="motif-cell">{{ r.motif }}</td>
                <td style="font-size:0.84rem;color:var(--text-secondary);">
                  {{ r.dateRetour | date:'dd MMM yyyy' }}
                </td>
                <td>
                  <span [ngClass]="getStatusClass(r.statut)" class="badge">
                    <i [ngClass]="getStatusIcon(r.statut)" class="ph"></i>
                    {{ getStatusLabel(r.statut) }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:8px;">
                    <button class="action-btn" (click)="$event.stopPropagation(); openDetail(r)" title="Voir le détail">
                      <i class="ph ph-eye"></i>
                    </button>
                    <button *ngIf="userRole === 'EMPLOYE' && (r.statut === 'EN_ATTENTE' || r.statut === 'PENDING')" 
                            class="action-btn" style="color:#60a5fa; background:rgba(59,130,246,0.1);"
                            (click)="$event.stopPropagation(); startEdit(r)" title="Modifier">
                      <i class="ph ph-pencil-simple"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Total indicator -->
      <div *ngIf="!isLoading && filteredRetours.length > 0" class="result-count">
        <i class="ph ph-list-numbers"></i>
        {{ filteredRetours.length }} résultat(s) affiché(s)
      </div>

    </div>

    <!-- ====== DETAIL MODAL ====== -->
    <div class="modal-overlay" *ngIf="selectedRetour" (click)="closeDetail()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="widget-card">
          <!-- Modal Header -->
          <div class="widget-header">
            <div>
              <h3 class="widget-title">Détail du retour #{{ selectedRetour.id }}</h3>
              <p style="margin:4px 0 0;font-size:0.85rem;color:#64748b;">Informations complètes sur cette demande</p>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.5rem;padding:4px;" (click)="closeDetail()">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <!-- Modal Body -->
          <div class="widget-body" style="padding:28px;">
            <!-- Status banner -->
            <div class="status-banner" [ngClass]="getBannerClass(selectedRetour.statut)">
              <i [ngClass]="getStatusIcon(selectedRetour.statut)" class="ph" style="font-size:1.4rem;"></i>
              <div>
                <strong>{{ getStatusLabel(selectedRetour.statut) }}</strong>
                <p style="margin:0;font-size:0.82rem;opacity:0.8;">{{ getStatusDescription(selectedRetour.statut) }}</p>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="detail-grid">
              <div class="detail-item" *ngIf="userRole === 'EMPLOYE' && selectedRetour.client">
                <label><i class="ph ph-user"></i> Client</label>
                <span>{{ selectedRetour.client.nom }} ({{ selectedRetour.client.email }})</span>
              </div>
              <div class="detail-item">
                <label><i class="ph ph-package"></i> Produit</label>
                <span>{{ selectedRetour.produit?.nom || 'Inconnu' }}</span>
              </div>
              <div class="detail-item">
                <label><i class="ph ph-calendar-blank"></i> Date du retour</label>
                <span>{{ selectedRetour.dateRetour | date:'dd MMMM yyyy' }}</span>
              </div>
              <div class="detail-item" style="grid-column:span 2;">
                <label><i class="ph ph-chat-text"></i> Motif déclaré</label>
                <span class="motif-text">{{ selectedRetour.motif }}</span>
              </div>
            </div>

            <!-- Timeline -->
            <h4 style="margin:24px 0 14px;font-size:0.9rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">
              Suivi de la demande
            </h4>
            <div class="status-timeline">
              <div class="timeline-step">
                <div class="timeline-dot done"><i class="ph ph-check"></i></div>
                <div class="timeline-content">
                  <div class="timeline-label">Demande créée</div>
                  <div class="timeline-date">{{ selectedRetour.dateRetour | date:'dd/MM/yyyy' }}</div>
                </div>
              </div>
              <div class="timeline-step">
                <div class="timeline-dot" [ngClass]="isProcessed(selectedRetour.statut) ? 'done' : 'active'">
                  <i [ngClass]="isProcessed(selectedRetour.statut) ? 'ph-check' : 'ph-hourglass'" class="ph"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-label">En cours de traitement</div>
                  <div class="timeline-date">Équipe qualité</div>
                </div>
              </div>
              <div class="timeline-step">
                <div class="timeline-dot" [ngClass]="isFinished(selectedRetour.statut) ? (isValidated(selectedRetour.statut) ? 'done' : 'pending') : 'pending'">
                  <i class="ph" [ngClass]="isValidated(selectedRetour.statut) ? 'ph-check-circle' : (isRejected(selectedRetour.statut) ? 'ph-x-circle' : 'ph-clock')"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-label">Décision finale</div>
                  <div class="timeline-date">{{ isFinished(selectedRetour.statut) ? getStatusLabel(selectedRetour.statut) : 'En attente...' }}</div>
                </div>
              </div>
            </div>

            <!-- Close button -->
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
              <button class="secondary-btn" (click)="closeDetail()" style="width:100%;justify-content:center;">
                <i class="ph ph-x"></i> Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== EDIT MODAL ====== -->
    <div class="modal-overlay" *ngIf="editingRetour" (click)="cancelEdit()">
      <div class="modal-container" (click)="$event.stopPropagation()" style="max-width:500px;">
        <div class="widget-card">
          <div class="widget-header">
            <h3 class="widget-title">Modifier le retour #{{ editingRetour.id }}</h3>
            <button style="background:none;border:none;cursor:pointer;" (click)="cancelEdit()">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <div class="widget-body" style="padding:24px;">
            <div class="form-group">
              <label class="form-label">Produit</label>
              <select class="form-control" [(ngModel)]="editingRetour.produit" name="editProd" [compareWith]="compareProduits">
                <option *ngFor="let p of produits" [ngValue]="p">{{ p.nom }}</option>
              </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
              <label class="form-label">Motif</label>
              <textarea class="form-control" [(ngModel)]="editingRetour.motif" name="editMotif" style="min-height:100px;"></textarea>
            </div>
            <div style="display:flex;gap:12px;margin-top:24px;">
              <button class="primary-btn" (click)="saveEdit()" style="flex:1;justify-content:center;">
                Enregistrer
              </button>
              <button class="secondary-btn" (click)="cancelEdit()" style="flex:1;justify-content:center;">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Stats Chips (Admin style) */
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
    .stat-chip.active-w { background: rgba(249,115,22,0.1); border-color: rgba(249,115,22,0.3); color:#fb923c; }
    .stat-chip.active-s { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color:#4ade80; }
    .stat-chip.active-d { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3);  color:#f87171; }

    /* Skeleton rows */
    .skeleton-row {
      height: 48px; border-radius: 8px; margin-bottom: 10px;
      background: linear-gradient(90deg, var(--card-bg) 25%, rgba(255,255,255,0.04) 50%, var(--card-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Table extras */
    .prod-icon {
      width: 30px; height: 30px; border-radius: 7px;
      background: rgba(59,130,246,0.1);
      display: flex; align-items: center; justify-content: center;
      color: #60a5fa;
    }
    .motif-cell {
      max-width: 220px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      color: var(--text-secondary); font-size: 0.87rem;
    }
    .retour-row { cursor: pointer; }

    /* Result count */
    .result-count {
      display: flex; align-items: center; gap: 6px;
      margin-top: 14px; font-size: 0.82rem; color: var(--text-secondary);
      padding: 0 4px;
    }

    /* Status banner (modal) */
    .status-banner {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: 12px; margin-bottom: 24px;
    }
    .status-banner.green  { background: rgba(34,197,94,0.1);  border: 1px solid rgba(34,197,94,0.2);  color: #166534; }
    .status-banner.red    { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2);  color: #991b1b; }
    .status-banner.orange { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); color: #9a3412; }
    .status-banner.blue   { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #1e40af; }

    /* Detail grid (modal) */
    .detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    .detail-item { display: flex; flex-direction: column; }
    .detail-item label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.3px;
      margin-bottom: 5px;
    }
    .detail-item span { font-size: 0.92rem; font-weight: 500; color: #0f172a; }
    .motif-text { line-height: 1.6; }
  `],
  styleUrls: ['../user-shared.css']
})
export class UserRetours implements OnInit {
  retours: RetourProduit[] = [];
  filteredRetours: RetourProduit[] = [];
  selectedRetour: RetourProduit | null = null;
  isLoading = true;
  searchQuery = '';
  activeFilter = 'ALL';
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  userRole = '';
  
  editingRetour: RetourProduit | null = null;
  produits: Produit[] = [];

  constructor(
    private retourService: RetourService,
    private authService: AuthService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) this.userRole = (user.role || '').trim().toUpperCase();

    this.authService.currentUser$.subscribe(u => {
      if (u) this.userRole = (u.role || '').trim().toUpperCase();
    });
    
    const isClient = user?.role === 'CLIENT';
    const source$ = isClient ? this.retourService.getMyRetours() : this.retourService.getRetours();

    if (this.userRole === 'EMPLOYE') {
      this.produitService.getProduits().subscribe(data => this.produits = data);
    }

    source$.subscribe({
      next: (data) => {
        this.retours = data;
        this.filteredRetours = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur retours', err);
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.retours;
    if (this.activeFilter === 'PENDING') list = list.filter(r => this.matchesStatus(r.statut, 'EN_ATTENTE'));
    if (this.activeFilter === 'VALID')   list = list.filter(r => this.matchesStatus(r.statut, 'VALIDE'));
    if (this.activeFilter === 'REJECT')  list = list.filter(r => this.matchesStatus(r.statut, 'REJETE'));

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        (r.produit?.nom || '').toLowerCase().includes(q) ||
        r.motif.toLowerCase().includes(q)
      );
    }
    this.filteredRetours = [...list].sort((a, b) => {
      const dateA = a.dateRetour ? new Date(a.dateRetour).getTime() : 0;
      const dateB = b.dateRetour ? new Date(b.dateRetour).getTime() : 0;
      if (dateA !== dateB) {
        return this.sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      }
      return this.sortOrder === 'DESC' ? (b.id || 0) - (a.id || 0) : (a.id || 0) - (b.id || 0);
    });
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.applyFilters();
  }

  countByStatus(status: string): number {
    return this.retours.filter(r => this.matchesStatus(r.statut, status)).length;
  }

  matchesStatus(statut: string, key: string): boolean {
    const s = (statut || '').toUpperCase();
    if (key === 'EN_ATTENTE') return s.includes('ATTENTE') || s.includes('PENDING');
    if (key === 'VALIDE')     return s.includes('VALID');
    if (key === 'REJETE')     return s.includes('REJET') || s.includes('REFUS');
    return false;
  }

  openDetail(r: RetourProduit): void  { this.selectedRetour = r; }
  closeDetail(): void                  { this.selectedRetour = null; }

  getStatusClass(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'badge-green';
    if (s.includes('REJET') || s.includes('REFUS')) return 'badge-red';
    if (s.includes('ATTENTE') || s.includes('PENDING')) return 'badge-orange';
    return 'badge-blue';
  }

  getStatusIcon(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'ph-check-circle';
    if (s.includes('REJET') || s.includes('REFUS')) return 'ph-x-circle';
    return 'ph-hourglass';
  }

  getStatusLabel(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'Validé';
    if (s.includes('REJET') || s.includes('REFUS')) return 'Rejeté';
    if (s.includes('ATTENTE') || s.includes('PENDING')) return 'En attente';
    return statut;
  }

  getStatusDescription(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'Votre retour a été approuvé par l\'équipe qualité.';
    if (s.includes('REJET') || s.includes('REFUS')) return 'Votre demande a été refusée. Contactez le support pour plus d\'informations.';
    return 'Votre demande est en cours d\'examen par l\'équipe qualité.';
  }

  getBannerClass(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s.includes('VALID')) return 'green';
    if (s.includes('REJET') || s.includes('REFUS')) return 'red';
    return 'orange';
  }

  isProcessed(statut: string): boolean {
    const s = (statut || '').toUpperCase();
    return s.includes('VALID') || s.includes('REJET');
  }
  isFinished(statut: string): boolean  { return this.isProcessed(statut); }
  isValidated(statut: string): boolean { return (statut || '').toUpperCase().includes('VALID'); }
  isRejected(statut: string): boolean  {
    const s = (statut || '').toUpperCase();
    return s.includes('REJET') || s.includes('REFUS');
  }

  // --- EDITION ---
  startEdit(retour: RetourProduit): void {
    this.editingRetour = JSON.parse(JSON.stringify(retour));
  }

  cancelEdit(): void {
    this.editingRetour = null;
  }

  saveEdit(): void {
    if (!this.editingRetour || !this.editingRetour.id) return;
    
    this.retourService.updateRetour(this.editingRetour.id, this.editingRetour).subscribe({
      next: (updated) => {
        const index = this.retours.findIndex(r => r.id === updated.id);
        if (index !== -1) {
          this.retours[index] = updated;
          this.applyFilters();
        }
        this.editingRetour = null;
      },
      error: (err) => console.error('Erreur modification', err)
    });
  }

  compareProduits(p1: Produit, p2: Produit): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }
}
